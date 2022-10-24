import proj4 from 'proj4'
import { getBbox } from './bbox'

/**
 * Guess if a topojson is on LatLong crs based on bbox
 * true if bbox is inside world boundaries
 */
export function isLonLat(bbox) {
    const [x0, y0, x1, y1] = bbox
    return x0 >= -180 && x1 <= 180
        && y0 >= -90 && y1 <= 90
        ? true
        : false
}

/**
 * Check if topojson use planar coordinates
 */
export function isPlanar(topo) {
    if (topo.proj === undefined) return !isLonLat(getBbox(topo))

    return topo.proj === "+proj=longlat +datum=WGS84" ? false : true
}

/**
 * Return an object with a proj4 string and it's function
 * {projString, projFn}
 * Input : a proj4 string ('+proj=...') or an EPSG code as 'EPSG=4326'.
 * In case of EPSG code, a request is made on https://epsg.io/
 * to check if exist and to get proj4 string of the first result.
 */
export function getProj(projection) {
    // Proj4 string
    if (projection.startsWith('+proj=')) {
        return {
            projString: projection,
            projFn: proj4(projection)
        }
    }

    // EPSG code
    // if (projection.startsWith('EPSG:') || projection.startsWith('EPSG=')) {
    //     // extract epsg code
    //     const code = projection.slice(5)
    //     // check if exist
    //     // const search = 
    //     return searchEPSG(code).then(search => {
    //         if (search.number_result === 0 || search.status !== "ok") {
    //             throw new Error("Not a valid EPSG code on https://epsg.io/")
    //         }
    //         const projString = search.results[0].proj4
    //         return {
    //             projString,
    //             projFn: proj4(projString)
    //         }
    //     })

    // }

    throw new Error("option.proj must start with '+proj=' or 'EPSG=' or 'EPSG:")
}

/**
 * Request on https://epsg.io/ for a specific EPSG code.
 * Strucure of response : {number_results: number, results: [{proj4,...}, ...], status: "ok"}
 */
// async function searchEPSG(epsg) {
//     const res = await fetch(`https://epsg.io/?q=${epsg}&format=json`)
//         .then((res) => {
//             if (!res.ok) throw new Error(`Error Code: ${res.status}. Error Reason: ${res.statusText}`);
//             return res.json()
//         })
//     return res
// }

/**
 * Project or unproject arcs positions
 * If inverse = true, use inverse projection to unproject arcs positions to WGS84
 */
export function projectArcs(topojson, proj, inverse = false) {
    return topojson.arcs.map(arc => {
        return arc.map((point, i) => inverse ? proj.inverse(point) : proj.forward(point))
    })
}

/**
 * Project or unproject Points|MultiPoints geometry of a topojson layer
 * If inverse = true, use inverse projection to unproject to WGS84
 */
export function projectPointsGeometry(object, proj, inverse = false) {
    switch (object.type) {
        case 'GeometryCollection':
            object.geometries.forEach(geom => projectPointsGeometry(geom, proj, inverse))
            break

        case 'Point':
            object.coordinates = inverse ? proj.inverse(object.coordinates) : proj.forward(object.coordinates)
            break

        case 'MultiPoint':
            object.coordinates = object.coordinates.map(point => inverse ? proj.inverse(point) : proj.forward(point))
            break

        default:
            return object
    }
}


// Non utilisé
// function proj4d3(proj4string) {
//     const degrees = 180 / Math.PI,
//       radians = 1 / degrees,
//       raw = proj4(proj4string),
//       p = function (lambda, phi) {
//         return raw.forward([lambda * degrees, phi * degrees]);
//       };
//     p.invert = function (x, y) {
//       return raw.inverse([x, y]).map(function (d) {
//         return d * radians;
//       });
//     };
//     const projection = d3.geoProjection(p).scale(1).translate([0, 0]);
//     projection.raw = raw;
//     return projection;
// }