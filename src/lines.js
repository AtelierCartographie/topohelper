import { meshArcs } from 'topojson-client'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Convert to a single MultiLineString a topojson or a topojson geometry object.
 * Point and MultiPoint geometry object are ignore.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index), if "all", all layers are used
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function lines(topo, options = {}) {
  let {chain, layer, addLayer, name} = options
  
  layer = getLayerName(topo, layer, {chain})
  name = name ?? "lines"


  
  const geometries = layer === "all" 
                    ? meshArcs(topo)                        // mesh of all the topology
                    : meshArcs(topo, topo.objects[layer])   // mesh of a single object
  const output = reconstructTopojson(topo, geometries, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)

  return output
}