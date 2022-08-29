import { topology } from 'topojson-server'
import { topohelper } from '../topohelperClass.js'

// input: one geojson or an array of geojson
// output : one topojson with layer, each geojson input = one topojson.objects
export function fromGeojson(geojson) {
    const topo = topology(geojson)
    return new topohelper(topo)
  }