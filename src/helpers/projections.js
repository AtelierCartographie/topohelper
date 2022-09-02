import proj4 from 'proj4'
import { GeoProjection, geoClipAntimeridian } from 'd3-geo'

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