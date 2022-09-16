import { geoIdentity, geoPath as d3geoPath } from 'd3-geo'
import { zoom as d3zoom} from 'd3-zoom'
import { select } from 'd3-selection'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './format/toTopojson.js'
import { simplify } from './simplify.js'
import { getBbox, mergeBbox, bboxToPolygon } from './helpers/bbox'
import { newCanvasContext2D, geometryRender } from './helpers/canvas.js'
import { getlastLayerName } from './helpers/layers.js'

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

    // In chain mode + {layer: "last"}, always render the last layer created
    if (chain && layer === "last") layer = getlastLayerName(geofile, Object.keys(geofile.objects))

    
    // TEST RENDER DIRECTLY FROM TOPOJSON
    let files = toTopojson(geofile, {layer, q: false})
    const rectBbox = bboxToPolygon(files.bbox)
    files = [files]
    

    // console.log(files.objects[layer])
  
    // // convert geofile to array
    // if (!Array.isArray(geofile)) geofile = [geofile] 
  
    // // geofile(s) convert into geojson
    // const files = geofile.map( (d,i) => toGeojson(d, {name: i, layer}) ).flat()

    // // (unique) bbox of geofile(s)
    // const bbox = mergeBbox( geofile.map(f => getBbox(f)) )

    // // bbox convert into a polygon (rectangle)
    // const rectBbox = bboxToPolygon(bbox)

  
    // CANVAS
    // Define a projection = use geofile as is, no reprojection
    const proj = geoIdentity().reflectY(true).fitSize([w, h], rectBbox)
  
    // Create a parent div element
    const geoViewer = document.createElement("div")
    geoViewer.id = "geoviewer"
    geoViewer.style.width = w + "px"
    geoViewer.style.height = h + "px"
  
    
    // ZOOM
    // Zoom event on parent div#geoviewer, not a canvas directly
    function addZoom(files) {
      select(geoViewer)
        .call(d3zoom()
                .scaleExtent([1, 100])
                .on("zoom", ({transform}) => zoomed(transform, files))
             )
    }
  
    // Apply zoom to each canvas of the geoviewer
    function zoomed(transform, files) {
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
            
            geometryRender(file, context, geoPath.pointRadius(1 / k), file.color, lineWidth)
        
            context.restore()
        }

        allCanvas.forEach( (c,i) => rendering(transform, files[i], c.getContext('2d'), allGeoPath[i]))
    }
    
  
    // CREATE CANVAS LAYERS
    // function to 1) create a canvas, 2) draw geometry, 3) add it to a node
    function addLayer(node, file) {
      const ctx = newCanvasContext2D(w,h, {id: file.name, layered: true})
      const geoPath = d3geoPath(proj, ctx).pointRadius(1)
      geometryRender(file.objects[layer], ctx, geoPath, file, file.color)
      node.append(ctx.canvas)
    }
  
    // couleurs différentes par calques, réutilisées si plus de 6 calques
    const colors = ["#333", "#ff3b00", "#1f77b4", "#2ca02c", "#9467bd", "#8c564b"]

    files.forEach((file,i) => {
      file.color = colors[i%6]
      addLayer(geoViewer, file)
    })
  
    if (zoom) addZoom(files)
  
    return geoViewer  
  }
