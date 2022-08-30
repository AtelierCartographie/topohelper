import { mesh, meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

export function innerlines (topo, options = {}) {
  let {chain, layer, group, geojson, addLayer, name} = options
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? "innerlines"

  // No geojson export in chain mode
  if (chain && geojson) {
    geojson = false
    const e = new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
    return e.message
  }

  const fn = geojson ? mesh : meshArcs
  
  const output = group
    ? fn(topo, topo.objects[layer], (a, b) => a.properties[group] !== b.properties[group])
    : fn(topo, topo.objects[layer], (a, b) => a !== b)

  const output_topojson = toTopojson(topo, output, {name, addLayer})
  addLastLayerName(output_topojson, name)
  
  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}