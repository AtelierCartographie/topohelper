import { bbox as topoBbox } from 'topojson-client'

// GET BBOX of topojson or geojson
export function getBbox(geofile) {
  // TOPOJSON
  // if topojson with a valid bbox
  if (geofile.type === "Topology" && geofile.bbox && geofile.bbox.length === 4) return geofile.bbox

  // if topojson without a valid bbox
  if (geofile.type === "Topology") return topoBbox(geofile)

  // GEOJSON
  // if geojson determine bbox
  if (geofile.type !== "Topology") {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity

    // Iterate over each coordinates and expanding the bounding box
    // if necessery flatten coordinates based on each geometry
    const expandBbox = (p) => {
      if (p[0] < x0) x0 = p[0]
      if (p[0] > x1) x1 = p[0]
      if (p[1] < y0) y0 = p[1]
      if (p[1] > y1) y1 = p[1]
    }
    
    const coordEach = (geo) => {
      switch (geo.type) {
        case 'Point':
          expandBbox(geo.coordinates)
          break
        case 'MultiPoint':
        case 'LineString':
          geo.coordinates.forEach(point => expandBbox(point))
          break
        case 'MultiLineString':
        case 'Polygon':
          geo.coordinates.flat(1).forEach(point => expandBbox(point))
          break
        case 'MultiPolygon':
          geo.coordinates.flat(2).forEach(point => expandBbox(point))
          break
        case 'GeometryCollection':
          geo.geometries.forEach(obj => coordEach(obj))
          break
        case 'FeatureCollection':
          geo.features.forEach(obj => coordEach(obj.geometry))
          break
      }
    }
    
    coordEach(geofile)

    return [x0, y0, x1, y1]
  }
}

// COMBINE SEVERAL BBOX into one bbox
// merge an array of bbox
export function mergeBbox(bboxes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity

  // Iterate over each coordinates and expanding the bounding box
  // if necessery flatten coordinates based on each geometry
  const expandBbox = (p) => {
    if (p[0] < x0) x0 = p[0]
    if (p[0] > x1) x1 = p[0]
    if (p[1] < y0) y0 = p[1]
    if (p[1] > y1) y1 = p[1]
  }
  
  // recomposer les bboxes en paire de coordonnées et réutiliser expandBbox
  bboxes.forEach( b => [ [ b[0], b[1] ], [ b[2], b[3] ] ].forEach(p => expandBbox(p)) )

  return [x0, y0, x1, y1]
}

// CONVERT BBOX INTO POLYGON
export function bboxToPolygon(bbox) {
  const [x0, y0, x1, y1] = bbox
  const polygon = {
         type: "Polygon",
         coordinates: [
             [
                 [x0, y0],
                 [x1, y0],
                 [x1, y1],
                 [x0, y1],
                 [x0, y0]
             ]
         ]
     }
  return polygon
}