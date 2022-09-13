import {transform, untransform, bbox} from 'topojson-client'
import {getProj} from './helpers/projections'

export function project (topo, options = {}) {
    let {chain, proj, fromProj, geojson} = options

    // No geojson export in chain mode
    if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")

    if (!proj) {
        const e = new Error("Missing arguments options.proj")
        return e.message
    }
    proj = getProj(proj, {topo, fromProj})

    const T = transform(topo.transform)

    topo.arcs = getArcsTransform(topo, T, proj) 

    // Check if topojson have Point or MultiPoint geometry
    // if so coordinates have to be transformed and projected too
    const allLyr = Object.keys(topo.objects)
    allLyr.forEach(lyr => getPointsTransform(topo.objects[lyr], T, proj))
  
    const box = bbox(topo)
    const newTransform = getTransform(box)
    const unT = untransform(newTransform)
  
    topo.bbox = box
    topo.transform = newTransform
    topo.arcs = getArcsTransform(topo, unT) 

    allLyr.forEach(lyr => getPointsTransform(topo.objects[lyr], unT))
    
    return topo
  }

// D'après https://github.com/topojson/topojson-client/blob/master/src/quantize.js#L11
function getTransform (bbox, q = 1e4) {
    const [x0, y0, x1, y1] = bbox

    return {scale: [x1 - x0 
                    ? (x1 - x0) / (q - 1) 
                    : 1,
                    y1 - y0 
                      ? (y1 - y0) / (q - 1) 
                      : 1],
            translate: [x0, y0]
           }
}

function TransformProjectPoint (point, i, transform, proj) {
    const pointTransform = transform(point,i)   // decoding or delta-encoding

    return proj
        ? proj.forward(pointTransform)          // point transform + projected
        : pointTransform                        // point transform only
}

function getArcsTransform (topojson, transform, proj) {
    return topojson.arcs.map(arc => {
        return arc.map((point,i) => TransformProjectPoint(point, i, transform, proj) )
    })
}

function getPointsTransform (object, transform, proj) {
    switch (object.type) {
        case 'GeometryCollection':
            object.geometries.forEach(geom => getPointsTransform(geom, transform, proj))
            break

        case 'Point':
            object.coordinates = TransformProjectPoint(object.coordinates, 0, transform, proj)
            break

        case 'MultiPoint':
            object.coordinates = object.coordinates.map((point, i) => TransformProjectPoint(point, i, transform, proj))
            break
    
        default: 
            return object
    }
}