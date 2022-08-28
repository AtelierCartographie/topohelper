import { feature } from 'topojson-client'

export function toGeojson(topo, id, options = {}) {
  const {layer} = options

  // If already a geojson, just add a name property
  if (topo.type !== "Topology") {
    topo.name = id ? id + 1 : 1
    return topo
  } 
  
  // Get all layers keys/name
  const allLyr = Object.keys(topo.objects)
  // In case of one layer, convert to string
  const cleanAllLyr = (lyrs) => lyrs.length === 1 ? allLyr[0] : allLyr
  // Retrieve layer name if index number
  const getLyrName = (lyrKey) => isNaN(lyrKey) ? lyrKey : allLyr[lyrKey]

  // Get layer list to convert
  const lyr = layer === undefined
    // if multiple layers and no layer option, convert all layers
    ? cleanAllLyr(allLyr)
    // if multiple layers and layer option, convert selected layers
    : Array.isArray(layer)
      ? layer.map(o => getLyrName(o))
      : getLyrName(layer)

  // Conversion to geojson + add layer name as property
  const convert = (layer) => {
    const geojson = feature(topo, topo.objects[layer])

    if (geojson.type === 'Feature') {
      return {type: 'FeatureCollection',
       features: [geojson],
       name: layer
      }
    }

    geojson.name = layer
    return geojson
  }
  
  return Array.isArray(lyr)
    ? lyr.map(o => convert(o))
    : convert(lyr)
  
}