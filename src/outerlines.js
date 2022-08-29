import { mesh, meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'


export function outerlines (topo, options = {}) {
  let {object, geojson, addLayer, name} = options
  object = object ?? Object.keys(topo.objects)[0]
  name = name ?? "outerlines"

  const fn = geojson ? mesh : meshArcs
  
  const output = fn(topo, topo.objects[object], (a, b) => a === b)
  const output_topojson = toTopojson(topo, output, {name, addLayer})
  
  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}