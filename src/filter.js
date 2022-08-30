import { filter as topoFilter } from 'topojson-simplify'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'

export function filter(topo, options = {}) {
  let {chain, object, condition, geojson, addLayer, name} = options
  object = object ?? Object.keys(topo.objects)[0]
  name = name ?? "filter"
  addLayer = addLayer ?? true

  // No geojson export in chain mode
  if (chain && geojson) {
    geojson = false
    const e = new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
    return e.message
  }

//   const copy = JSON.parse(JSON.stringify(topo)) // Deep copy
  const subset = topo.objects[object].geometries.filter(condition ? condition : d => d)

  let output_topojson

  if (addLayer) {
    output_topojson = toTopojson(topo, subset, {name, addLayer, collection: true})
  } else {
    topo.objects[object].geometries = subset
    output_topojson = topoFilter(topo)
  }

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}