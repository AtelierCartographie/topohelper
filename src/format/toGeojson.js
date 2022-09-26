import { feature } from 'topojson-client'
import { getLayersName } from '../helpers/layers.js'

/**
 * Convert topojson to geojson
 *
 * @param {GeoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {String|String[]|Number|Number[]} options.layer - target layers (name or index). If omit or "all" use all layers. Ex: {layer: "lyr"} | {layer: ["lyr", 1]}
 * @returns {GeoJSON}
 */
export function toGeojson(topo, options = {}) {
  let {layer} = options
  layer = getLayersName(topo, layer)

  // Conversion to geojson + add layer name as property
  const convert = (layer) => {
    const geojson = feature(topo, topo.objects[layer])

    if (geojson.type === 'Feature') {
      return {type: 'FeatureCollection',
       features: [geojson],
       name: layer
      }
    }

    geojson.name = layer
    return geojson
  }
  
  return layer.length > 1
    ? layer.map(lyr => convert(lyr))
    : convert(layer)
}