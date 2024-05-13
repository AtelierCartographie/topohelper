import { mergeArcs as topoMergeArcs } from "topojson-client";
import { reconstructTopojson } from "./helpers/reconstructTopojson.js";
import { addLastLayerName, getLayerName } from "./helpers/layers.js";

/**
 * Union an array of Polygon|MultiPolygon
 * Share arcs of adjacent Polygon|MultiPolygon are removed
 * A group by a property can be applied at the same time.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode or single function mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String} options.groupby - groupby by a data properties before merging
 * @param {String} options.name - name of the new layer
 * @param {Boolean} options.addLayer - true add a layer to existing ones
 * @returns {TopoJSON}
 */
export function merge(topo, options = {}) {
  let { chain, layer, groupby, name, addLayer } = options;

  layer = getLayerName(topo, layer, { chain });
  name = name ?? groupby ? `merge_groupby_${groupby}` : "merge";

  if (!groupby) {
    const geometries = topoMergeArcs(topo, topo.objects[layer].geometries);
    const output = reconstructTopojson(topo, geometries, { name, addLayer });

    // Update topojson.lastLayer property
    addLastLayerName(output, name);

    return output;
  }

  // GROUPBY properties
  const geom = topo.objects[layer].geometries;
  const groupby_map = Map.groupBy(geom, (d) => d.properties[groupby]);
  const groupby_features = [];
  groupby_map.forEach((value, key) => {
    const features = topoMergeArcs(topo, value);
    groupby_features.push({ ...features, properties: { groupby: key } });
  });

  const output = reconstructTopojson(topo, groupby_features, {
    name,
    collection: true,
    addLayer,
  });

  // Update topojson.lastLayer property
  addLastLayerName(output, name);

  // return geojson or topojson
  return output;
}
