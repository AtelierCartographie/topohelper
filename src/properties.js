import * as aq from 'arquero'
import { getLayerName, getLayerProperties } from "./helpers/layers"

/**
 * Manipulate properties of a topojson layer with Arquero
 * Only three arquero verb are available: select, rename and derive
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String|String[]} options.select - parameter of arquero 'select' verb
 * @param {Object} options.rename - parameter of arquero 'rename' verb
 * @param {Object} options.derive - parameter of arquero 'derive' verb
 * @returns {TopoJSON}
 */
export function properties (topo, options = {}) {
    let {chain, layer, select, rename, derive} = options
    layer = getLayerName(topo, layer, {chain})

    // Handle operation order
    delete options.chain
    delete options.layer
    const order = Object.keys(options)

    // Get properties of the layer, throw error if none
    const table = getLayerProperties(topo, layer)

    // Convert to an arquero table
    let aqTable = aq.from(table)
    
    // Store each arquero operation as a function...
    const S = () => aqTable = aqTable.select(select)
    const R = () => aqTable = aqTable.rename(rename)
    const D = () => aqTable = aqTable.derive(derive)
    // ... and gather them in a Map
    const opFn = new Map([
      ["select", S],
      ["rename", R],
      ["derive", D]
    ])

    // Apply arquero operation in good order
    order.forEach(d => opFn.get(d)())
  
    // Convert back to an array of objects
    aqTable = aqTable.objects()
    
    // replace each old properties object with the new one
    topo.objects[layer].geometries.map((d,i) => d.properties = aqTable[i])
    
    return topo
  }