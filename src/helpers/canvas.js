// Create a canvas with a 2D context and automatic pixel density scaling
// Optional id and absolute position style for layering several canvas
export function newCanvasContext2D(width, height, options = {}) {
    const {id, layered} = options

    const dpi = devicePixelRatio // window.devicePixelRatio

    const canvas = document.createElement("canvas")
    canvas.width = width * dpi
    canvas.height = height * dpi
    canvas.style.width = width + "px"
    canvas.id = id

    if (layered === true) canvas.style.position = "absolute"

    const context = canvas.getContext("2d")
    context.scale(dpi, dpi)

    return context
}

// Canvas render of geojson geometries
// If FeatureCollection or GeometryCollection, iterate over each geometry object
export function geometryRender(geojson, context, geoPath, lineWidth = 0.5) {
    // TEST GEOMETRY TYPE TO ADAPT RENDER
    switch (geojson.type) {
      case 'Point':
      case 'MultiPoint':
        context.fillStyle = "#333"
        context.beginPath()
        geoPath(geojson)
        context.fill()
        break
  
      case 'LineString':
      case 'MultiLineString':
        context.lineCap = "round"
        context.lineJoin = "round"
        context.strokeStyle = "#333"
        context.lineWidth = lineWidth
        context.beginPath()
        geoPath(geojson)
        context.stroke()
        break
  
      case 'Polygon':
      case 'MultiPolygon':
        context.lineCap = "round"
        context.lineJoin = "round"
        context.strokeStyle = "#333"
        context.lineWidth = lineWidth
        context.beginPath()
        geoPath(geojson)
        context.stroke()
        break
  
      case 'GeometryCollection':
        geojson.geometries.forEach(obj => geometryRender(obj, context, geoPath))
        break
  
      case 'FeatureCollection':
        geojson.features.forEach(obj => geometryRender(obj.geometry, context, geoPath))
        break
  
      default:
        console.log("Sorry, not a valid geojson")
    }
  }