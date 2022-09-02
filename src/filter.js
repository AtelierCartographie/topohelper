import { filter as topoFilter } from 'topojson-simplify'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

/**
 * Filter a topojson
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {Function} options.condition - condition of filtering as an arraw function
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.geojson - true convert output from topojson to geojson (only in single function mode)
 * @returns {TopoJSON|GeoJSON}
 */
export function filter(topo, options = {}) {
  let {chain, layer, condition, name, addLayer, geojson} = options
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? "filter"
  addLayer = addLayer ?? true

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")

  const subset = topo.objects[layer].geometries.filter(condition ? condition : d => d)

  let output_topojson

  if (addLayer) {
    output_topojson = toTopojson(topo, subset, {name, addLayer, collection: true})
  } else {
    const copy = JSON.parse(JSON.stringify(topo)) // Deep copy, for single function mode
    copy.objects[layer].geometries = subset
    output_topojson = topoFilter(copy)
  }

  // Update topojson.lastLayer property
  addLastLayerName(output_topojson, name)

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}