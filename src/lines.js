import { meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

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
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? "lines"

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
  
  const output = layer === "all" 
                    ? meshArcs(topo)                        // mesh of all the topology
                    : meshArcs(topo, topo.objects[layer])   // mesh of a single object
  const output_topojson = toTopojson(topo, output, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output_topojson, name)

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}