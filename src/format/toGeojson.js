import { feature } from 'topojson-client'

export function toGeojson(topo, options = {}) {
  const {object} = options
  const obj = object ? object : Object.keys(topo.objects)[0]
  return feature(topo, topo.objects[obj])
}