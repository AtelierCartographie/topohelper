import { bbox } from 'topojson-client'
import { isPlanar, getProj, projectArcs, projectPointsGeometry } from './helpers/projections'

/**
 * Unproject a projected topojson to WGS84 with proj4.
 * By default use topo.proj property to determine origin projection.
 * No clipping operation is made if topojson geometry intersect projection limit.
 * Ex: antimeridian or pole.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String} options.from - origin projection as a proj4 string. Ex: "+proj=robin"
 * @returns {TopoJSON}
 */
export function unproject(topo, options = {}) {
    let { chain, from } = options

    // LOGIC
    // 1. Check if is already projected = not planar
    // 2. Get proj from proj4 string or epsg code (need network)
    // 3. Unproject arc position
    // 4. Unproject Point|MultiPoint if there is
    // 5. Update bbox
    // 6. store proj4 string in topo.proj property

    if (!isPlanar(topo)) throw new Error(`Can't unproject non-projected topojson.`)
    if (topo.proj === undefined && !from) throw new Error('Need {option.from} to determine origin projection.')
    if (!from && topo.proj) from = topo.proj

    const { projFn } = getProj(from)

    // Project arcs positions
    topo.arcs = projectArcs(topo, projFn, true)

    // Check if topojson have Point or MultiPoint geometry
    // if so coordinates have to be projected too
    const allLyr = Object.keys(topo.objects)
    allLyr.forEach(lyr => projectPointsGeometry(topo.objects[lyr], projFn, true))

    topo.bbox = bbox(topo)
    topo.proj = "+proj=longlat +datum=WGS84"

    return topo
}