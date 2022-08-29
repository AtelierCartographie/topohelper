import { mesh, meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'

export function innerlines (topo, options = {}) {
  let {object, group, geojson, addLayer, name} = options
  object = object ?? Object.keys(topo.objects)[0]
  name = name ?? "innerlines"

  const fn = geojson ? mesh : meshArcs
  
  const output = group
    ? fn(topo, topo.objects[object], (a, b) => a.properties[group] !== b.properties[group])
    : fn(topo, topo.objects[object], (a, b) => a !== b)

  const output_topojson = toTopojson(topo, output, {name, addLayer})
  
  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}