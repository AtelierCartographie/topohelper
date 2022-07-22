import { filter } from 'topojson-simplify'

// Fonction interne pour conserver le format topojson dans certaines opérations
export function toTopojson(topo, geometries, collection = false) {
  const obj = {
    type: "topology",
    transform: topo.transform,
    arcs: topo.arcs,
    objects: (collection)
      ? {
          group: {
            type: "GeometryCollection",
            geometries
          }
        }
      : { geometries }
  }

  return filter(obj)
}