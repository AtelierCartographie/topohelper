import { filter as topoFilter } from 'topojson-simplify'

export function filter(topo, options = {}) {
  const {object, condition, geojson} = options
  const obj = object ? object : Object.keys(topo.objects)[0]

//   const copy = JSON.parse(JSON.stringify(topo)) // Deep copy
  const subset = topo.objects.a_com2021_2154.geometries.filter(condition ? condition : d => d)
  topo.objects.a_com2021_2154.geometries = subset

  const filtered = topoFilter(topo)

  return geojson
    ? toGeojson(filtered)
    : filtered
}