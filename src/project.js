import { bbox } from 'topojson-client'
import { isPlanar, getProj, projectArcs, projectPointsGeometry } from './helpers/projections'

/**
 * Project a topojson with proj4.
 * /!\ Implement a naive approach => No clipping operation is made if topojson geometry intersect projection limit (ex: antimeridian, poles).
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String} options.proj - a proj4 string. Ex: "+proj=robin"
 * @returns {TopoJSON}
 */
export function project(topo, options = {}) {
    let { chain, proj } = options

    // LOGIC
    // 1. Check if is unprojected
    // 2. Get proj from proj4 string or epsg code (need network)
    // 3. Project arc position
    // 4. Project Point|MultiPoint if there is
    // 5. Update bbox
    // 6. store proj4 string in topo.proj property

    if (isPlanar(topo)) throw new Error(`Can't project already projected topojson. Current projection: "${topo.proj}"`)
    if (!proj) throw new Error("Missing arguments options.proj")

    const { projString, projFn } = getProj(proj)

    // Project arcs positions
    topo.arcs = projectArcs(topo, projFn)

    // Check if topojson have Point or MultiPoint geometry
    // if so coordinates have to be projected too
    const allLyr = Object.keys(topo.objects)
    allLyr.forEach(lyr => projectPointsGeometry(topo.objects[lyr], projFn))

    topo.bbox = bbox(topo)
    topo.proj = projString

    return topo
}

// D'après https://github.com/topojson/topojson-client/blob/master/src/quantize.js#L11
// function getTransform(bbox, q = 1e4) {
//     const [x0, y0, x1, y1] = bbox

//     return {
//         scale: [x1 - x0
//             ? (x1 - x0) / (q - 1)
//             : 1,
//         y1 - y0
//             ? (y1 - y0) / (q - 1)
//             : 1],
//         translate: [x0, y0]
//     }
// }