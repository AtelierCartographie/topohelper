import { mesh, meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'

export function lines(topo, options = {}) {
  let {chain, layer, geojson, addLayer, name} = options
  layer = layer ?? Object.keys(topo.objects)[0]
  name = name ?? "lines"

  // No geojson export in chain mode
  if (chain && geojson) {
    geojson = false
    const e = new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
    return e.message
  }

  const fn = geojson ? mesh : meshArcs
  
  const output = fn(topo, topo.objects[layer])
  const output_topojson = toTopojson(topo, output, {name, addLayer})

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}