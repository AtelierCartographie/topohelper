import { decodeTopo } from "../helpers/transform.js";
import { topohelper } from "../topohelperClass.js";
import { getBbox } from "../helpers/bbox.js";

/**
 * Instantiate a topohelper class of a topojson
 * A deep copy of the topojson can be made.
 *
 * @param {TopoJSON} topo - A valid single topojson object
 * @param {Boolean} options.deep - create a deep copy of the topojson. Default is false.
 * @returns {topohelper}
 */
export function fromTopojson(topo, options = {}) {
  let { deep } = options;
  deep = deep ?? false;
  if (Array.isArray(topo)) throw new Error("Expect only a single topojson.");

  // deep copy of the topojson ?
  const copy = deep ? structuredClone(topo) : topo;
  // get and add a bbox property
  copy.bbox = getBbox(copy);

  // decode arcs and Point|MultiPoint
  if (copy.transform !== undefined) return new topohelper(decodeTopo(copy));

  return new topohelper(copy);
}
