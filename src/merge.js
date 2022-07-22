import { merge as topoMerge, mergeArcs as topoMergeArcs } from 'topojson-client'
import { toTopojson } from './helpers/toTopojson.js'

export function merge(topo, options = {}) {
  const {object, group, geojson} = options
  const obj = object ? object : Object.keys(topo.objects)[0]
  const fn = geojson ? topoMerge : topoMergeArcs
  
  if (!group) {
    const output = fn(topo, topo.objects[obj].geometries)
    
    return geojson
      ? output
      : toTopojson(topo, output)
  } 

  // GroupBy
  // list of values of the group variable
  const values = topo.objects[obj].geometries.map(d => d.properties[group])
  // Dedupe = unique list of values
  const groups = new Set(values)

  // merge features by group 
  const groupBy_features = Array.from(groups)
          .map ( g => [g, 
                       fn(topo,   
                                      topo.objects[obj].geometries
                                      .filter(d => d.properties[group] === g))] )
  
          .map(d => geojson 
                      ? ({type:'Feature', properties:{group: d[0]}, geometry:d[1]})
                      : ({...d[1], properties: {group: d[0]}} ))

  // return geojson or topojson syntax
  return geojson
    ? {type: "FeatureCollection", features: groupBy_features}
    : toTopojson(topo, groupBy_features, true)
  
}