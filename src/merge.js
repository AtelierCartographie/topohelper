import { merge as topoMerge, mergeArcs as topoMergeArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'

export function merge(topo, options = {}) {
  let {object, group, geojson, addLayer, name} = options
  object = object ?? Object.keys(topo.objects)[0]
  name = name ?? group ? `merge_groupBy_${group}` : "merge"

  const fn = geojson ? topoMerge : topoMergeArcs
  
  if (!group) {
    const output = fn(topo, topo.objects[object].geometries)
    const output_topojson = toTopojson(topo, output, {name, addLayer})
    
    return geojson
      ? toGeojson(output_topojson)
      : output_topojson
  } 

  // GroupBy
  // list of values of the group variable
  const values = topo.objects[object].geometries.map(d => d.properties[group])
  // Dedupe = unique list of values
  const groups = new Set(values)

  // merge features by group 
  const groupBy_features = Array.from(groups)
          .map ( g => [g, 
                       fn(topo,   
                                      topo.objects[object].geometries
                                      .filter(d => d.properties[group] === g))] )
  
          .map(d => geojson 
                      ? ({type:'Feature', properties:{group: d[0]}, geometry:d[1]})
                      : ({...d[1], properties: {group: d[0]}} ))

  const groupBy_features_topojson = toTopojson(topo, groupBy_features, {name, collection: true, addLayer})

  // return geojson or topojson syntax
  return geojson
    ? toGeojson(groupBy_features_topojson) // {type: "FeatureCollection", features: groupBy_features}
    : groupBy_features_topojson
  
}