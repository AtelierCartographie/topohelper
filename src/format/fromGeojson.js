import { topology } from 'topojson-server'
import { topohelper } from '../topohelperClass.js'

export function fromGeojson(geojson) {
    const topo = topology(geojson)
    return new topohelper(topo)
  }