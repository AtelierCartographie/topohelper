import { mesh, meshArcs } from 'topojson-client'
import { toTopojson } from './helpers/toTopojson.js'

export function lines(topo, options = {}) {
  const {object, geojson} = options
  const obj = object ? object : Object.keys(topo.objects)[0]
  const fn = geojson ? mesh : meshArcs
  
  const mesh = fn(topo, topo.objects[obj])

  return geojson
    ? mesh
    : toTopojson(topo, mesh)
}