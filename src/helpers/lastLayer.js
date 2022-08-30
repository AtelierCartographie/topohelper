export function addLastLayerName(topo, name) {
    topo.lastLayer = name
}

export function getlastLayerName(topo) {
    return topo.lastLayer === undefined
        ? Object.keys(topo.objects)[0]
        : topo.lastLayer
}