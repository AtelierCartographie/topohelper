import { filter as topoFilter } from 'topojson-simplify'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

export function filter(topo, options = {}) {
  let {chain, layer, condition, geojson, addLayer, name} = options
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? "filter"
  addLayer = addLayer ?? true

  // No geojson export in chain mode
  if (chain && geojson) {
    geojson = false
    const e = new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
    return e.message
  }

//   const copy = JSON.parse(JSON.stringify(topo)) // Deep copy
  const subset = topo.objects[layer].geometries.filter(condition ? condition : d => d)

  let output_topojson

  if (addLayer) {
    output_topojson = toTopojson(topo, subset, {name, addLayer, collection: true})
  } else {
    topo.objects[layer].geometries = subset
    output_topojson = topoFilter(topo)
  }

  addLastLayerName(output_topojson, name)

  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}