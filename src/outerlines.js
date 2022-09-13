import { meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Remove share arcs of adjacent Polygon|MultiPolygon
 * Return a MultiLineString
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.geojson - true convert output from topojson to geojson (only in single function mode)
 * @returns {TopoJSON|GeoJSON}
 */
export function outerlines (topo, options = {}) {
  let {chain, layer, geojson, addLayer, name} = options
  
  layer = getLayerName(topo, layer, chain)
  name = name ?? "outerlines"

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
  
  const geometries = meshArcs(topo, topo.objects[layer], (a, b) => a === b)
  const output = toTopojson(topo, geometries, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)
  
  return geojson
    ? toGeojson(output)
    : output
}