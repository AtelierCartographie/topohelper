import { filter } from 'topojson-simplify'

// Fonction interne pour conserver le format topojson dans certaines opérations
// et ajouter le résultat d'opérations sous forme de couche dans topojson.objects
export function toTopojson(topo, geometries, options = {}) {
  let {name, collection, addLayer} = options
  collection = collection ?? false
  addLayer = addLayer ?? true

  const geom = (collection)
    ? {
        [name]: {
          type: "GeometryCollection",
          geometries
        }
      }
    : { [name]: geometries }

  const obj = {
    type: "topology",
    transform: topo.transform,
    arcs: topo.arcs,
    objects: (addLayer)
      ? {...topo.objects,
         ...geom
        }
      : { ...geom }
  }

  return (addLayer) ? obj : filter(obj)
}