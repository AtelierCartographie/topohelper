import { filter } from 'topojson-simplify'

/**
 * Inject geometries to a topojson as a layer.
 * Geometries can be a single geometry (Point, MultiPoint, LineString...) or an array of geometries.
 * Geometries are injected inside topojson.objects as a new layer (other layers stay as is)
 * or as a replacement of all existing layers.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object|Object[]} geometries
 * @param {Object} options - optional parameters except for name
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.collection - true : inject geometries inside a "GeometryCollection"
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */

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

  const {objects, ...rest} = topo
  const output = {
    ...rest,
    objects: (addLayer)
      ? {...objects,
         ...geom}
      : {...geom}
  }

  return (addLayer) ? output : filter(output)
}