import { getLayerName, getLayerProperties } from "../helpers/layers"

export function toObjects (topo, options = {}) {
    let {chain, layer} = options
    layer = getLayerName(topo, layer, {chain})

    // Get properties of the layer, throw error if none
    const table = getLayerProperties(topo, layer)
    
    return table
}