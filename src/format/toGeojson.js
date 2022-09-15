import { feature } from 'topojson-client'
import { getLayersName } from '../helpers/layers.js'

/**
 * Convert topojson to geojson
 *
 * @param {TopoJSON|GeoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {String} options.name - if geojson as input add a name property to it
 * @param {String|String[]|Number|Number[]} options.layer - target layers (name or index). If omit or "all" use all layers. Ex: {layer: "lyr"} | {layer: ["lyr", 1]}
 * @returns {GeoJSON}
 */
export function toGeojson(topo, options = {}) {
  let {name, layer} = options
  layer = getLayersName(topo, layer)

  // Specific to the view() function who can also accept geojson as input
  // If already a geojson, just add a name property
  if (topo.type !== "Topology") {
    topo.name = name ?? 0
    return topo
  } 

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