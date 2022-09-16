import proj4 from 'proj4'
import { getBbox } from './bbox'

// Guess if a topojson is on LatLong crs based on bbox
// true if bbox is inside world boundaries
export function isLonLat (bbox) {
    const [x0, y0, x1, y1] = bbox
    return x0 >= -180 && x1 <= 180
        && y0 >= -90 && y1 <= 90
            ? true
            : false
}

export function isPlanar (topo) {
    if (topo.proj === undefined) !isLonLat(getBbox(topo))
    
    return topo.proj == "+proj=longlat +datum=WGS84" ? false : true
}

export function getProj (projection, options = {}) {
    const {from, topo} = options
    
    // Already a proj4 function
    // /!\ attention peut poser problème pour stocker 
    // la valeur string du proj4 en propriété du topojson
    if (typeof projection === "function") return projection

    // FROM PROJECTION
    const fromProj = topo.proj 
                        ? topo.proj
                        : from
                            ? from
                            : null

    // Proj4 string
    const proj = fromProj ? proj4(fromProj, projection) : proj4(projection)

    topo.proj = projection

    return proj
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