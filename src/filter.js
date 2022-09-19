import { filter as topoFilter } from 'topojson-simplify'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'
import { getBbox } from './helpers/bbox.js'

/**
 * Filter a topojson
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {Function} options.condition - condition of filtering as an arraw function
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function filter(topo, options = {}) {
  let {chain, layer, condition, name, addLayer} = options
  
  layer = getLayerName(topo, layer, {chain})
  name = name ?? "filter"
  addLayer = addLayer ?? true

  const throwError = () => new Error ("No condition submit. Ex:  {condition: d => d.properties.pop > 100")

  const subset = topo.objects[layer].geometries.filter(condition ? condition : throwError())

  let output

  if (addLayer) {
    output = reconstructTopojson(topo, subset, {name, addLayer, collection: true})
  } else {
    // const copy = JSON.parse(JSON.stringify(topo)) // Deep copy, for single function mode
    topo.objects[layer].geometries = subset
    output = topoFilter(topo)
    delete output.transform
    delete output.bbox
    output.bbox = getBbox(output)
    return output
  }

  // Update topojson.lastLayer property
  addLastLayerName(output, name)

  return output
}