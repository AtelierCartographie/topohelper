import { presimplify, quantile, simplify as topoSimplify, sphericalTriangleArea } from "topojson-simplify"
import { toGeojson } from "./format/toGeojson"
import { isPlanar } from "./helpers/projections"

/**
 * Simplify a topojson.
 * 
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {Number} options.level - a level of simplification between 0 and 1. 1 = no simplification, 0 = maximum. Default 0.5
 * @returns {TopoJSON}
 */
export function simplify (topo, options = {}) {
  let {chain, level, geojson} = options
  level = level ?? 0.5

  let topoS = presimplify(topo, isPlanar(topo) ? undefined : sphericalTriangleArea)
  const min_weight = quantile(topoS, level)
  topoS = topoSimplify(topoS, min_weight)

  const {arcs, ...rest} = topo
  const output = {arcs: topoS.arcs, ...rest}


  return output
}