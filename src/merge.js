import * as aq from 'arquero'
import { mergeArcs as topoMergeArcs } from 'topojson-client'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName, getLayerProperties } from './helpers/layers.js'

/**
 * Union an array of Polygon|MultiPolygon
 * Share arcs of adjacent Polygon|MultiPolygon are removed
 * A group by a property can be applied at the same time.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.group - group by a data properties before
 * @param {Object} options.rollup - aggregate properties in conjunction with the group by. Use rollup arquero verb
 * @param {Object} options.join - Join left an external table after merge. Parameter of arquero 'join' verb. ex: {data: table, on: "id", values: "newColumn"}
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function merge(topo, options = {}) {
  let {chain, layer, group, rollup, join, name, addLayer} = options

  layer = getLayerName(topo, layer, {chain})
  name = name ?? group ? `merge_groupBy_${group}` : "merge"
  
  if (!group) {
    const geometries = topoMergeArcs(topo, topo.objects[layer].geometries)
    const output = reconstructTopojson(topo, geometries, {name, addLayer})

    // Update topojson.lastLayer property
    addLastLayerName(output, name)

    return output
  } 

  
  // ROLLUP PROPERTIES
  let aqTable = aq.from(getLayerProperties(topo, layer))
                    .groupby(group)
                    .rollup(rollup)

  // JOIN EXTERNAL TABLE
  if (join) {
    aqTable = aqTable.join(join.data.hasOwnProperty("_nrows") ? join.data : aq.from(join.data),
                           join.on,
                           join.values)
  }
  // rollup + join as an array of objects
  const table = aqTable.objects()

  // MERGE GEOMETRY + GROUP BY
  // list of values of the group variable
  const groups = aqTable.array(group)

  // merge features by group 
  const groupBy_features = groups
          .map(g => topoMergeArcs(topo, topo.objects[layer].geometries.filter(d => d.properties[group] === g)))
          .map((d,i) => ({...d, properties: table[i]} ))

  const output = reconstructTopojson(topo, groupBy_features, {name, collection: true, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)

  // return geojson or topojson
  return output
}