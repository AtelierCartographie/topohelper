export function addLastLayerName(topo, name) {
    topo.lastLayer = name
}

export function getlastLayerName(topo, keys) {
    return topo.lastLayer === undefined
        ? keys[0]
        : topo.lastLayer
}

// TODO handle multiple layers name return for export function toGeojson() and toTopojson()
export const getLayerName = (topo, layer, options = {}) => {
    let {chain, array} = options

    // Array of layers name
    const keys = Object.keys(topo.objects)
    
    // In chain mode, use last layer
    if (chain && layer === undefined) return getlastLayerName(topo, keys)

    // if no options.layer and don't need all layers, use first layer
    if (layer === undefined) return keys[0]

    // if a valid index (integer + less than index length)
    if (Number.isInteger(layer) && layer >= 0 && layer <= keys.length) return keys[layer]

    // if a layer name that exist
    if (keys.includes(layer)) return layer

    throw new Error("Not an existing layer name or index")
  }

export function getLayersName (topo, layers) {
    // Return all layers if no parameters
    if (layers === undefined || layers === "all") return Object.keys(topo.objects)

    return Array.isArray(layers)
        ? layers.map(lyr => getLayerName(topo, lyr))
        // return a single layer inside an array or not
        : [getLayerName(topo, layers)]
}