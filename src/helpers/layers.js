export function addLastLayerName(topo, name) {
    topo.lastLayer = name
}

export function getlastLayerName(topo, keys) {
    return topo.lastLayer === undefined
        ? keys[0]
        : topo.lastLayer
}

export const getLayerName = (topo, layer, chain) => {
    const keys = Object.keys(topo.objects)
    
    // In chain mode, use last layer
    if (chain && layer === undefined) return getlastLayerName(topo, keys)

    // if no options.layer, use first layer
    if (layer === undefined) return keys[0]

    // if a valid index (interger + less than index length)
    if (Number.isInteger(layer) && layer >= 0 && layer <= keys.length) return keys[layer]

    // if a layer name that exist
    if (keys.includes(layer)) return layer

    throw new Error("Not an existing layer name or index")
  }