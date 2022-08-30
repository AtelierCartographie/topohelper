import { merge as topoMerge, mergeArcs as topoMergeArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

export function merge(topo, options = {}) {
  let {chain, layer, group, geojson, addLayer, name} = options
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? group ? `merge_groupBy_${group}` : "merge"

  // No geojson export in chain mode
  if (chain && geojson) {
    geojson = false
    const e = new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
    return e.message
  }

  const fn = geojson ? topoMerge : topoMergeArcs
  
  if (!group) {
    const output = fn(topo, topo.objects[layer].geometries)
    const output_topojson = toTopojson(topo, output, {name, addLayer})
    addLastLayerName(output_topojson, name)

    return geojson
      ? toGeojson(output_topojson)
      : output_topojson
  } 

  // GroupBy
  // list of values of the group variable
  const values = topo.objects[layer].geometries.map(d => d.properties[group])
  // Dedupe = unique list of values
  const groups = new Set(values)

  // merge features by group 
  const groupBy_features = Array.from(groups)
          .map ( g => [g, 
                       fn(topo,   
                                      topo.objects[layer].geometries
                                      .filter(d => d.properties[group] === g))] )
  
          .map(d => geojson 
                      ? ({type:'Feature', properties:{group: d[0]}, geometry:d[1]})
                      : ({...d[1], properties: {group: d[0]}} ))

  const groupBy_features_topojson = toTopojson(topo, groupBy_features, {name, collection: true, addLayer})
  addLastLayerName(groupBy_features_topojson, name)

  // return geojson or topojson syntax
  return geojson
    ? toGeojson(groupBy_features_topojson) // {type: "FeatureCollection", features: groupBy_features}
    : groupBy_features_topojson
  
}