import { topology } from 'topojson-server'
import { topohelper } from '../topohelperClass.js'

/**
 * Instantiate a topohelper class from a geojson or an array of geojson
 * Before inputs are convert to a single topojson
 *
 * @param {GeoJSON|GeoJSON[]} topo - A valid geojson or an array of geojson
 * @returns {topohelper}
 */
export function fromGeojson(geojson) {
    const topo = topology(geojson)
    return new topohelper(topo)
  }