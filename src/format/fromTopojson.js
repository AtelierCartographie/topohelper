import { topohelper } from '../topohelperClass.js'

/**
 * Instantiate a topohelper class of a topojson
 * Before a deep copy of the topojson is made
 *
 * @param {TopoJSON} topo - A valid single topojson object
 * @returns {topohelper}
 */
export function from(topo) {
    if (Array.isArray(topo)) throw new Error("Expect only a single topojson.")

    const copy = JSON.parse(JSON.stringify(topo))
    return new topohelper(copy)
}