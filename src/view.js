import { geoIdentity, geoContains, geoPath as d3geoPath } from 'd3-geo'
import { zoom as d3zoom} from 'd3-zoom'
import { select, pointer } from 'd3-selection'
import { toTopojson } from './format/toTopojson.js'
import { simplify } from './simplify.js'
import { bboxToPolygon } from './helpers/bbox'
import { newCanvasContext2D, geometryRender } from './helpers/canvas.js'
import { getlastLayerName, getLayersName } from './helpers/layers.js'
import { fromTopojson } from './format/fromTopojson.js'
import { fromGeojson } from './format/fromGeojson.js'
import { meshArcs } from 'topojson-client'
import Flatbush from 'flatbush'
import { getGeomCoordinates } from './helpers/transform.js'

/**
 * TODO
 * 
 *
 * @param {TopoJSON|GeoJSON} topo - A topojson object in chain mode or topojson|geojson[] in single function mode
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index). If "last" + chain mode, render the last layer created. If omit or "all" render all layers.
 * @param {Boolean} options.zoom - true add a d3 zoom
 * @param {Number[]} options.size - canvas dimensions as [width, height]
 * @returns {HTMLCanvasElement}
 */
export function view(geofile, options = {}) {
    let {chain, layer, zoom, tooltip, size} = options
    const [w,h] = size ?? [document.body.clientWidth, document.body.clientWidth]
    tooltip = tooltip ?? true

    // SINGLE FUNCTION MODE
    // Convert topojson or geojson|geojson[] into topohelper topojson
    if (chain !== true) {
      geofile = (!Array.isArray(geofile) && geofile.type === "Topology")
        ? fromTopojson(geofile).topojson
        : fromGeojson(geofile)
    }

    // In chain mode + {layer: "last"}, always render the last layer created
    if (chain && layer === "last") layer = getlastLayerName(geofile, Object.keys(geofile.objects))
    layer = getLayersName(geofile, layer)
    
    // RENDER DIRECTLY IN CANVAS FROM TOPOJSON
    // Original topojson
    const raw = toTopojson(geofile, {layer, q: false})
    const {arcs, bbox} = raw
    const rectBbox = bboxToPolygon(bbox)

    // Geometry objects of original topojson convert to mesh is no Point|MultiPoint present
    const files = toMesh(raw, layer)

    // Simplified topojson used when zooming
    const {arcs: lightArcs} = simplify(raw, {level: 0.2})

  
    // CANVAS
    // Define a projection = use geofile as is, no reprojection
    const proj = geoIdentity().reflectY(true).fitSize([w, h], rectBbox)
  
    // Create a parent div element
    const geoViewer = document.createElement("div")
    geoViewer.id = "geoviewer"
    geoViewer.style.width = w + "px"
    geoViewer.style.height = h + "px"
    // Create a div to receive pointer coordinates infos
    const coordsInfo = document.createElement("div")
    coordsInfo.id = "coords"
    coordsInfo.style.position = "absolute", coordsInfo.style.zIndex = "1"
    coordsInfo.style.bottom = "10px", coordsInfo.style.left = "10px"
    coordsInfo.style.padding = "0 5px"
    coordsInfo.style.fontFamily = "sans-serif", coordsInfo.style.fontSize = "12px"
    coordsInfo.style.background = "rgba(255,255,255,0.7)"

    geoViewer.append(coordsInfo)
  
    // couleurs différentes par calques, réutilisées si plus de 6 calques
    const colors = ["#333", "#ff3b00", "#1f77b4", "#2ca02c", "#9467bd", "#8c564b"]

    

    // CREATE CANVAS LAYERS AND RENDER LAYERS
    files.forEach((file,i) => {
      file.color = colors[i%6]
      addLayer(geoViewer, file, layer[i])
    })
  
    if (zoom) addZoom()
    // Save current transform
    let currentTransform = {x: 0, y: 0, k: 1}
    if (tooltip) {
      // Create a div to receive properties infos of geometry hover
      const pInfo = document.createElement("div")
      pInfo.id = "propertyPanel"
      pInfo.style.position = "absolute", pInfo.style.zIndex = "1"
      pInfo.style.top = "10px", pInfo.style.left = "10px"
      pInfo.style.padding = "5px"
      pInfo.style.fontFamily = "sans-serif", pInfo.style.fontSize = "12px"
      pInfo.style.background = "rgba(255,255,255,0.7)"

      geoViewer.append(pInfo)
      
      // Create canvas that will receive hover geometries
      const ctx = newCanvasContext2D(w,h, {id: "tooltip", layered: true})
      geoViewer.append(ctx.canvas)
      const geoPath = d3geoPath(proj, ctx).pointRadius(5)

      select(geoViewer).on("mousemove", event => mousemoved(event))
    
      // FLATBUSH
      // determine number of items
      // GeometryCollection or Single Geometry
      const geometry = raw.objects[layer[0]].type === "GeometryCollection"
                          ? raw.objects[layer[0]].geometries
                          : [raw.objects[layer[0]]]
      const indexSize = geometry.length 
      // create our Flatbush index
      let index = new Flatbush(indexSize)

      const addToIndex = (geom) => {
        // bbox of each feature to pass in Flatbush
        let bbox
        if (geom.type === "Point") {
          const [x, y] = proj(geom.coordinates)
          bbox = [[x-10, y-10], [x+10, y+10]] // buffer around point pixel coordinates
        } else {
          bbox = geoPath.bounds(getGeomCoordinates(raw.arcs, geom))
        }
        const [[x0, y0], [x1, y1]] = bbox
    
        // and now, add bbox feature to our index
        index.add(
          Math.floor(x0), Math.floor(y0),
          Math.ceil(x1),  Math.ceil(y1)
        )
      }

      // Fill index
      geometry.forEach(addToIndex)
      // Perform the indexing
      index.finish()

      // TOOLTIP
      function mousemoved (event) {
        const {x: zx, y: zy, k: zk} = currentTransform
        const pixel = pointer(event)
        const [x, y] = [(pixel[0] - zx) / zk, (pixel[1] - zy) / zk]

        const inverted = proj.invert([x, y])
        select(coordsInfo).text(inverted[0].toLocaleString() + " ; " + inverted[1].toLocaleString())

        const results = index.search(x, y, x, y)
        
        if (results.length > 0) {
          // pick first result for now
          let found = results[0]
          let foundGeom = getGeomCoordinates(raw.arcs, geometry[found])
          // Check if one of results is inside
          results.forEach(i => {
            const geom = geometry[i]
            const geomCoords = getGeomCoordinates(raw.arcs, geom)
            if (geoContains(geomCoords, inverted)) {
              found = i
              foundGeom = geomCoords
            }
          })

          // Show properties panel
          pInfo.style.display = "block"
          objectToTable(foundGeom.properties, pInfo)

          // Render canvas
          const dpi = devicePixelRatio
          

          ctx.canvas.width = ctx.canvas.width
          ctx.save()
          ctx.clearRect(0, 0, w, h)
          // modification de l'état du canvas avec la transformation désirée
          ctx.translate(dpi * zx, dpi * zy)  
          ctx.scale(dpi * zk, dpi * zk)
          const lineWidth = 2 / zk // constant lineWidth
          ctx.canvas.style.cursor = 'pointer'
          geometryRender(foundGeom, ctx, geoPath.pointRadius(5 / zk), undefined, "#ff3b00", lineWidth)
          ctx.restore()

        } else {
          // Clear canvas
          ctx.clearRect(0, 0, w, h)
          ctx.canvas.style.cursor = null
          // hide properties panel
          pInfo.style.display = "none"
        }

        
      }
    }

    
    
    // ZOOM
    // Zoom event on parent div#geoviewer, not on canvas directly
    function addZoom() {
      select(geoViewer)
        .call(d3zoom()
                .scaleExtent([1, 100])
                .on("zoom", ({transform}) => zoomed(transform, files, lightArcs))
                .on("end",  ({transform}) => zoomed(transform, files, arcs))
             )
    }
  
    // Apply zoom to each canvas of the geoviewer
    function zoomed(transform, files, arcs) {
        currentTransform = transform
        const dpi = devicePixelRatio

        // clear tooltip canvas when pan & zoom
        if (tooltip) {
          const cvTooltip = geoViewer.querySelector('canvas#tooltip')
          cvTooltip.width = cvTooltip.width
        }

        const allCanvas = [...geoViewer.querySelectorAll('canvas:not(#tooltip)')] // HTMLCollection to array
        const allGeoPath = allCanvas.map(c => d3geoPath(proj, c.getContext("2d")))

        function rendering(transform, file, context, geoPath) {
            const {x,y,k} = transform
            
            context.canvas.width = context.canvas.width
        
            context.save()
            context.clearRect(0, 0, w, h)
        
            // modification de l'état du canvas avec la transformation désirée
            context.translate(dpi * x, dpi * y)  
            context.scale(dpi * k, dpi * k)
        
            // ajustement pour que l'épaisseur reste en réalité constante visuellement
            const lineWidth = 0.5 / k
            
            geometryRender(file, context, geoPath.pointRadius(1 / k), arcs, file.color, lineWidth)
        
            context.restore()
        }

        allCanvas.forEach( (c,i) => rendering(transform, files[i], c.getContext('2d'), allGeoPath[i]))
    }
    
    // function to 1) create a canvas, 2) draw geometry, 3) add it to a node
    function addLayer(node, file, layer) {
      const ctx = newCanvasContext2D(w,h, {id: layer, layered: true})
      const geoPath = d3geoPath(proj, ctx).pointRadius(1)
      geometryRender(file, ctx, geoPath, arcs, file.color)
      node.append(ctx.canvas)
    }
  
    return geoViewer  
  }

  /**
   * Check if a geometry object of a topojson contains Point|MultiPoint
   * Return boolean
   */
  function containsPoint (geom) {
    switch (geom.type) {
      case 'GeometryCollection':
        return geom.geometries.map(g => containsPoint(g)).includes(true)
      case 'Point':
      case 'MultiPoint':
        return true
      default:
        return false
    }
  }

  /**
   * Convert to a mesh every layers without Point|MultiPoint.
   * If a layer has Point|MultiPoint, it's return without modification.
   * Return an array of geometry object
   */
  function toMesh (topo, layers) {
    const contains = layers.map(L => containsPoint(topo.objects[L]))
    return layers.map((L,i) => contains[i] === false
                                  ? meshArcs(topo, topo.objects[L])
                                  : topo.objects[L]
                    )
  }

  /**
   * Generate an html table from a properties Object
   * {key1: value1, key2: value2...}
   */
  function objectToTable(object, node) {
    if (!object) return
    node.replaceChildren()

    const data = Object.entries(object)
    // creates a <table> element and a <tbody> element
    const tbl = document.createElement("table")

    data.forEach(row => {
      const R = document.createElement("tr")
      row.forEach(cell => {
        const C = document.createElement("td")
        const Ctext = document.createTextNode(cell)
        C.appendChild(Ctext)
        R.appendChild(C)
      })
      // add the row to the end of the table body
      tbl.appendChild(R)
    })
    
    node.appendChild(tbl);
  }
