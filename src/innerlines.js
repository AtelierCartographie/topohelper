import { mesh, meshArcs } from 'topojson-client'
import { toTopojson } from './helpers/toTopojson.js'

export function innerlines (topo, options = {}) {
  const {object, group, geojson} = options
  const obj = object ? object : Object.keys(topo.objects)[0]
  const fn = geojson ? mesh : meshArcs
  
  const output = group
    ? fn(topo, topo.objects[obj], (a, b) => a.properties[group] !== b.properties[group])
    : fn(topo, topo.objects[obj], (a, b) => a !== b)
  
  return geojson
    ? output
    : toTopojson(topo, output)
}