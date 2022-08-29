import { topohelper } from '../topohelperClass.js'

// input: one topojson
// output : deep copy of the same topojson
export function from(topo) {
    const copy = JSON.parse(JSON.stringify(topo))
    return new topohelper(copy)
}