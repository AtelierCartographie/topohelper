import { decodeTopo } from '../helpers/transform.js'
import { topohelper } from '../topohelperClass.js'
import { getBbox } from '../helpers/bbox.js'
import { isLonLat } from '../helpers/projections.js'

/**
 * Instantiate a topohelper class of a topojson
 * Before a deep copy of the topojson is made
 *
 * @param {TopoJSON} topo - A valid single topojson object
 * @returns {topohelper}
 */
export function fromTopojson(topo) {
    if (Array.isArray(topo)) throw new Error("Expect only a single topojson.")

    // const copy = JSON.parse(JSON.stringify(topo))
    const copy = structuredClone(topo)
    // get and add a bbox property
    copy.bbox = getBbox(copy)
    // Guess if projected or unprojected coordinates
    copy.proj = isLonLat(copy.bbox) ? "+proj=longlat +datum=WGS84" : "unknown"

    // decode arcs and Point|MultiPoint
    if (copy.transform === undefined) return new topohelper(decodeTopo(copy))
    
    return new topohelper(copy)
}