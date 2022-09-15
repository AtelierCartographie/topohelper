import { mergeArcs as topoMergeArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Union an array of Polygon|MultiPolygon
 * Share arcs of adjacent Polygon|MultiPolygon are removed
 * A group by a property can be applied at the same time.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.group - group by a data properties before
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.geojson - true convert output from topojson to geojson (only in single function mode)
 * @returns {TopoJSON|GeoJSON}
 */
export function merge(topo, options = {}) {
  let {chain, layer, group, name, addLayer, geojson} = options

  layer = getLayerName(topo, layer, {chain})
  name = name ?? group ? `merge_groupBy_${group}` : "merge"

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
  
  if (!group) {
    const geometries = topoMergeArcs(topo, topo.objects[layer].geometries)
    const output = reconstructTopojson(topo, geometries, {name, addLayer})

    // Update topojson.lastLayer property
    addLastLayerName(output, name)

    return geojson
      ? toGeojson(output)
      : output
  } 

  // GroupBy
  // list of values of the group variable
  const values = topo.objects[layer].geometries.map(d => d.properties[group])
  // Dedupe = unique list of values
  const groups = new Set(values)

  // merge features by group 
  const groupBy_features = Array.from(groups)
          .map ( g => [g, 
                       topoMergeArcs(topo,   
                                      topo.objects[layer].geometries
                                      .filter(d => d.properties[group] === g))] )
  
          .map(d => ({...d[1], properties: {group: d[0]}} ))

  const output = reconstructTopojson(topo, groupBy_features, {name, collection: true, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)

  // return geojson or topojson
  return geojson
    ? toGeojson(output)
    : output
}