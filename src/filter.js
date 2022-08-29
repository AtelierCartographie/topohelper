import { filter as topoFilter } from 'topojson-simplify'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'

export function filter(topo, options = {}) {
  let {object, condition, geojson, addLayer, name} = options
  object = object ?? Object.keys(topo.objects)[0]
  name = name ?? "filter"

//   const copy = JSON.parse(JSON.stringify(topo)) // Deep copy
  const subset = topo.objects[object].geometries.filter(condition ? condition : d => d)

  let output_topojson

  if (addLayer) {
    output_topojson = toTopojson(topo, subset, {name, addLayer})
  } else {
    topo.objects[object].geometries = subset
    output_topojson = topoFilter(topo)
  }

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}