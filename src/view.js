import { geoIdentity, geoPath as d3geoPath } from 'd3-geo'
import { zoom as d3zoom} from 'd3-zoom'
import { select } from 'd3-selection'
import { toTopojson } from './format/toTopojson.js'
import { simplify } from './simplify.js'
import { bboxToPolygon } from './helpers/bbox'
import { newCanvasContext2D, geometryRender } from './helpers/canvas.js'
import { getlastLayerName, getLayersName } from './helpers/layers.js'
import { fromTopojson } from './format/fromTopojson.js'
import { fromGeojson } from './format/fromGeojson.js'
import { meshArcs } from 'topojson-client'

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
    let {chain, layer, zoom, size} = options
    const [w,h] = size ?? [document.body.clientWidth, document.body.clientWidth]

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
  
    // couleurs différentes par calques, réutilisées si plus de 6 calques
    const colors = ["#333", "#ff3b00", "#1f77b4", "#2ca02c", "#9467bd", "#8c564b"]

    // CREATE CANVAS LAYERS AND RENDER LAYERS
    files.forEach((file,i) => {
      file.color = colors[i%6]
      addLayer(geoViewer, file, layer[i])
    })
  
    if (zoom) addZoom()

    
    // ZOOM
    // Zoom event on parent div#geoviewer, not a canvas directly
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
        const dpi = devicePixelRatio

        const allCanvas = [...geoViewer.getElementsByTagName('canvas')] // HTMLCollection to array
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
