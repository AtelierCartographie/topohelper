import isInside from 'point-in-polygon-hao'
import polylabel from 'polylabel'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'
import { getArcsCoordinates } from './helpers/transform.js'

/**
 * Get centroids of each Polygon|MultiPolygon of a topojson layer
 * Point|MultiPoint and LineString|MultiLineString geometry object are ignore.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.better - true calcul pole of inaccessibility instead of centroid
 * @returns {TopoJSON}
 */
export const centroids = (topo, options = {}) => {
    let {chain, layer, name, addLayer, better} = options

    layer = getLayerName(topo, layer, {chain})
    name = name ?? "centroids"
  
    // Handle GeometryCollection and single geometry differently
    const lyr = topo.objects[layer]
    const centroids = lyr.hasOwnProperty("geometries")
      ? topo.objects[layer].geometries
          .filter(geom => ["Polygon", "MultiPolygon"].includes(geom.type))
          .map(geom => ({
              type: "Point",
              properties: {...geom.properties},
              coordinates: getCentroid(topo, geom, better)}))
      : {
        type: "Point",
        properties: {...lyr.properties},
        coordinates: getCentroid(topo, lyr, better)
        }
      

    if (centroids.length === 0) throw new Error(`Can't calcul centroids because no Polygon|MultiPolygon in the layer ${layer}`)
    const output = reconstructTopojson(topo, centroids, {name, collection: true, addLayer})

    // Update topojson.lastLayer property
    addLastLayerName(output, name)

    return output
  }


// Calcul centroids as mean of all vertices
const getCentroid = (topo, geometry, better) => {
    // Structured array with points coordinates of a polygon
    let polyCoords
    // List of all points coordinates of one polygon = a flat array
    let vertices

    // Polygon and MultiPolygon handle differently
    switch (geometry.type) {
        case 'Polygon':
            polyCoords = geometry.arcs.map(arcs => getArcsCoordinates(topo.arcs, arcs))
            if (!better) vertices = polyCoords.flat()
            break
        case 'MultiPolygon':
            const multiPolyCoords = geometry.arcs.map(poly => poly.map(arcs => getArcsCoordinates(topo.arcs, arcs)))
            const areas = multiPolyCoords.map(poly => getBboxFromCoordinates(poly.flat()))
                                         .map(bbox => getAreaFromBbox(bbox))
                                         .map(d => d === Infinity ? null : d) // fix error with empty polygon array resulting in Infinity bbox value
            const largestPolyIndex = areas.indexOf(Math.max(...areas))
            polyCoords = multiPolyCoords[largestPolyIndex]
            if (!better) vertices = polyCoords.flat()
            break
        default:
            break
    }
  

    // Option to force use of pole of inaccessibility with polylabel
    if (better) return polylabel(polyCoords, 1.0)


    // FIRST TRY : CENTROID
    // Mean of all vertices as xSum / nbVertices and ySum / nbVertices
    const centroid = vertices
      .reduce((prev, curr) => [prev[0] + curr[0], prev[1] + curr[1]]) // [xSum, ySum]
      .map(v => v/ vertices.length)                                   // divide by number of vertices
    // Check if centroid is inside the polygon
    if (isInside(centroid, polyCoords)) return centroid

    // SECOND TRY : BBOX CENTER
    // Very simplist alternative to centroid
    const bboxCenter = centerOfBbox( getBboxFromCoordinates(polyCoords.flat()) )
    if (isInside(bboxCenter, polyCoords)) return bboxCenter

    // THIRD TRY : POLE OF INACCESSIBILITY
    // With polylabel, https://github.com/mapbox/polylabel
    return polylabel(polyCoords, 1.0)
  }


  // Get bbox from an array of coordinates
  const getBboxFromCoordinates = (coords) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity

    // Iterate over each coordinates and expanding the bounding box
    const expandBbox = (p) => {
      if (p[0] < x0) x0 = p[0]
      if (p[0] > x1) x1 = p[0]
      if (p[1] < y0) y0 = p[1]
      if (p[1] > y1) y1 = p[1]
    }

    coords.forEach(point => expandBbox(point))

    return [x0, y0, x1, y1]
  }

  const getAreaFromBbox = (bbox) => {
    const [x0, y0, x1, y1] = bbox
    // if planar
    const area = (x1 - x0) * (y1 - y0)
    return area
  }

  // Get the center of a bbox
  const centerOfBbox = (bbox) => {
    const [x0, y0, x1, y1] = bbox
    return [(x0 + x1) / 2, (y0 + y1) / 2]
  }