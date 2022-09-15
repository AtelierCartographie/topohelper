import { topology } from 'topojson-server'
import { topohelper } from '../topohelperClass.js'
import { getBbox } from '../helpers/bbox.js'
import { isLonLat } from '../helpers/projections.js'

/**
 * Instantiate a topohelper class from a geojson or an array of geojson
 * Before inputs are convert to a single topojson
 *
 * @param {GeoJSON|GeoJSON[]} topo - A valid geojson or an array of geojson
 * @param {Object} options - optional parameters except for name
 * @param {String|String[]} options.name - name of the new layer
 * @returns {topohelper}
 */
export function fromGeojson(geojson, options = {}) {
    let {name} = options
    name = name ?? "original"

    // convert parameters geojson and name to array if necessary
    if (!Array.isArray(geojson)) geojson = [geojson]
    if (!Array.isArray(name)) name = [name]

    // structure input of topojson.topology as {foo: foo.geojson, bar: bar.geojson}
    let input = {}
    geojson.length == name.length
      ? geojson.forEach((f,i) => input[name[i]] = f)
      : input = geojson

    // null because no quantization, will be added if choices at export
    const topo = topology(input, null)
    // get and add a bbox property
    topo.bbox = getBbox(geojson)
    // Guess if projected or unprojected coordinates
    topo.proj = isLonLat(topo.bbox) ? "+proj=longlat +datum=WGS84" : "unknown"

    return new topohelper(topo)
  }