import { mesh, meshArcs } from 'topojson-client'
import { toTopojson } from './helpers/toTopojson.js'


export function outerlines (topo, options = {}) {
  const {object, geojson} = options
  const obj = object ? object : Object.keys(topo.objects)[0]
  const fn = geojson ? mesh : meshArcs
  
  const output = fn(topo, topo.objects[obj], (a, b) => a === b)
  
  return geojson
    ? output
    : toTopojson(topo, output)
}