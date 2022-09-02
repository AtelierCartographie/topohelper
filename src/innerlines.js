import { meshArcs } from 'topojson-client'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { addLastLayerName, getlastLayerName } from './helpers/lastLayer.js'

/**
 * Keep share arcs of adjacent Polygon|MultiPolygon
 * A group by a property can be applied at the same time.
 * Return a MultiLineString
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters except for name
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.group - group by a data properties before
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @param {Boolean} options.geojson - true convert output from topojson to geojson (only in single function mode)
 * @returns {TopoJSON|GeoJSON}
 */
export function innerlines (topo, options = {}) {
  let {chain, layer, group, addLayer, name, geojson} = options
  layer = layer 
            ? layer
            : chain
              ? getlastLayerName(topo)
              : Object.keys(topo.objects)[0]
  name = name ?? "innerlines"

  // No geojson export in chain mode
  if (chain && geojson) throw new Error("In chain mode, operations only return topojson. Use toGeojson() instead.")
  
  const output = group
    ? meshArcs(topo, topo.objects[layer], (a, b) => a.properties[group] !== b.properties[group])
    : meshArcs(topo, topo.objects[layer], (a, b) => a !== b)

  const output_topojson = toTopojson(topo, output, {name, addLayer})

  // Update topojson.lastLayer property
  addLastLayerName(output_topojson, name)
  
  return geojson
    ? toGeojson(output_topojson)
    : output_topojson
}