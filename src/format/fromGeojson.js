import { topology } from 'topojson-server'
import { topohelper } from '../topohelperClass.js'
import { getBbox } from '../helpers/bbox.js'
import { isLonLat } from '../helpers/projections.js'

/**
 * Instantiate a topohelper class from a geojson or an array of geojson
 * Before inputs are convert to a single topojson
 *
 * @param {GeoJSON|GeoJSON[]} topo - A valid geojson or an array of geojson
 * @returns {topohelper}
 */
export function fromGeojson(geojson, options = {}) {
    let {name} = options
    name = name ?? "original"
    
    const topo = topology({[name]: geojson})
    // get and add a bbox property
    topo.bbox = getBbox(geojson)
    // Guess if projected or unprojected coordinates
    topo.proj = isLonLat(topo.bbox) ? "+proj=longlat +datum=WGS84" : "unknown"

    return new topohelper(topo)
  }