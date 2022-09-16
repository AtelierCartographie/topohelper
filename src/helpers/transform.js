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

export function getArcsCoordinates (topo, arcs) {
    return arcs.map(i => i >= 0 
        ? topo.arcs[i]    // positive arc index
        : topo.arcs[~i]   // negative arc index
              .slice()      // shallow copy to not alter original order points arc
              .reverse()    // important to reconstruct geometry
    )
}

export function getGeomCoordinates (topo, geom) {
  const {arcs, type, ...rest} = geom
  let coordinates = []
  switch (type) {
    case 'LineString':
      coordinates = getArcsCoordinates(topo, arcs)
      break
    case 'MultiLineString':
      coordinates = arcs.map(line => getArcsCoordinates(topo, line))
      break
    case 'Polygon':
      coordinates = arcs.map(ring => getArcsCoordinates(topo, ring))
      break
    case 'MultiPolygon':
      coordinates = arcs.map(poly => poly.map(p => getArcsCoordinates(topo, p)))
      break
  }
  return {
    type,
    ...rest,
    coordinates
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