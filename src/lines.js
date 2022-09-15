import { meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Convert to a single MultiLineString a topojson or a topojson geometry object.
 * Point and MultiPoint geometry object are ignore.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index), if "all", all layers are used
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.geojson - true convert output from topojson to geojson (only in single function mode)
 * @returns {TopoJSON|GeoJSON}
 */
export function lines(topo, options = {}) {
  let {chain, layer, addLayer, name, geojson} = options
  
  layer = getLayerName(topo, layer, {chain})
  name = name ?? "lines"

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
  
  const geometries = layer === "all" 
                    ? meshArcs(topo)                        // mesh of all the topology
                    : meshArcs(topo, topo.objects[layer])   // mesh of a single object
  const output = reconstructTopojson(topo, geometries, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)

  return geojson
    ? toGeojson(output)
    : output
}