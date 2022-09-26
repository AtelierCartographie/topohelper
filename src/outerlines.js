import { meshArcs } from 'topojson-client'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Remove share arcs of adjacent Polygon|MultiPolygon
 * Return a MultiLineString
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function outerlines (topo, options = {}) {
  let {chain, layer, addLayer, name} = options
  
  layer = getLayerName(topo, layer, {chain})
  name = name ?? "outerlines"
  
  const geometries = meshArcs(topo, topo.objects[layer], (a, b) => a === b)
  const output = reconstructTopojson(topo, geometries, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)
  
  return output
}