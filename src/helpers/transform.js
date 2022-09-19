import {transform} from 'topojson-client'

export function decodeTopo (topo, proj) {

    const T = transform(topo.transform)

    topo.arcs = getArcsTransform(topo, T, proj) 

    // Check if topojson have Point or MultiPoint geometry
    // if so coordinates have to be transformed and projected too
    const allLyr = Object.keys(topo.objects)
    allLyr.forEach(lyr => getPointsTransform(topo.objects[lyr], T, proj))

    delete topo.transform

    return topo
}

export function getArcsCoordinates (topoArcs, arcs) {
    return arcs.map((arcIndex, i) => arcIndex >= 0 
        ? cleanCoordinates(topoArcs[arcIndex], i)   // positive arc index
        : cleanCoordinates(topoArcs[~arcIndex]      // negative arc index
                            .slice()                // shallow copy to not alter original order points arc
                            .reverse(), i)          // important to reconstruct geometry
    ).flat()
}

export function getGeomCoordinates (topoArcs, geom) {
  const {arcs, type, ...rest} = geom
  let coordinates = []
  switch (type) {
    case 'LineString':
      coordinates = getArcsCoordinates(topoArcs, arcs)
      break
    case 'MultiLineString':
      coordinates = arcs.map(line => getArcsCoordinates(topoArcs, line))
      break
    case 'Polygon':
      coordinates = arcs.map(ring => getArcsCoordinates(topoArcs, ring))
      break
    case 'MultiPolygon':
      coordinates = arcs.map(poly => poly.map(p => getArcsCoordinates(topoArcs, p)))
      break
  }
  return {
    type,
    ...rest,
    coordinates
  }
}

// Remove subsequent identical positions between arcs, https://github.com/topojson/topojson-specification#214-arc-indexes
const cleanCoordinates = (coords, i) => i > 0 ? coords.slice(1) : coords


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