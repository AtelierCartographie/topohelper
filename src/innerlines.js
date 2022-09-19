import { meshArcs } from 'topojson-client'
import { reconstructTopojson } from './helpers/reconstructTopojson.js'
import { addLastLayerName, getLayerName } from './helpers/layers.js'

/**
 * Keep share arcs of adjacent Polygon|MultiPolygon
 * A group by a property can be applied at the same time.
 * Return a MultiLineString
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.group - group by a data property before
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function innerlines (topo, options = {}) {
  let {chain, layer, group, addLayer, name} = options

  layer = getLayerName(topo, layer, {chain})
  name = name ?? "innerlines"
  
  const geometries = group
    ? meshArcs(topo, topo.objects[layer], (a, b) => a.properties[group] !== b.properties[group])
    : meshArcs(topo, topo.objects[layer], (a, b) => a !== b)

  const output = reconstructTopojson(topo, geometries, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output, name)
  
  return output
}