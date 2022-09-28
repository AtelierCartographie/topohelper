/**
 * Retrieve main information about a topojson: bbox, projection and layers list.
 * For each layer:  name, geometry type, number of objects, properties
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @returns {Object}
 */
export function info (topo) {
    const {bbox, proj: projection, objects} = topo
    let layers = Object.keys(objects)
  
    function geometryInfos (lyr) {
      let type, records, properties
      const object = objects[lyr]
      
      switch (object.type) {
        case 'GeometryCollection':
          type = object.geometries[0].type
          records = object.geometries.length
          properties = object.geometries[0].properties
          break
        case 'Polygon':
        case 'MultiPolygon':
          type = 'Polygon'
        case 'LineString':
        case 'MultiLineString':
          type = 'LineString'
        case 'Point':
        case 'MultiPoint':
          type = 'Point'
        default:
          records = 1
          properties = object.properties
      }
      
      return {name: lyr, type, records, properties}
    }
    
    let output = {
      bbox,
      projection,
      layers: layers.map(geometryInfos)
    }
    return output
  }