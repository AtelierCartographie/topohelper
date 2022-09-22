import { getLayersName } from '../helpers/layers.js'
import { filter } from 'topojson-simplify'
import { quantize } from 'topojson-client'

/**
 * Convert a topohelper topojson to a classic topojson
 * Option to select layers
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {String|String[]|Number|Number[]} options.layer - target layers (name or index). If omit or "all" use all layers. Ex: {layer: "lyr"} | {layer: ["lyr", 1]}
 * @param {Boolean|Number} options.q - level of quantization. if true quantization is applied with a 1e4 value.
 * @returns {TopoJSON}
 */
export function toTopojson (topo, options = {}) {
    let {layer, q} = options
    q = q ?? 1e4
    layer = getLayersName(topo, layer)

    // Deep copy of topojson
    topo = structuredClone(topo)

    const allLayers = Object.keys(topo.objects)

    // Store proj property to reinject later
    const {proj} = topo

    // SELECT LAYERS
    if (layer.length != allLayers.length) {
        // Non intersection = layers to delete
        const deleteLayers = allLayers.filter(lyr => !layer.includes(lyr))

        // Delete non wanted layers
        deleteLayers.forEach(lyr => delete topo.objects[lyr])

        // Drop unused arcs
        topo = filter(topo) // /!\ proj property is dropped !!!
    }

    // QUANTIZATION
    if (q == false) {
        delete topo.lastLayer
        return topo
    }
    topo = quantize(topo, q)

    // Reinject proj property
    topo.proj = proj

    return topo
}