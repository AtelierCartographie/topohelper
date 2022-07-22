import { topohelper } from '../topohelperClass.js'

export function from(topo) {
    const copy = JSON.parse(JSON.stringify(topo))
    return new topohelper(copy)
}