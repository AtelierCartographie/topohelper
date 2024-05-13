import { getBbox } from "./bbox";

/**
 * Guess if a topojson is on LatLong crs based on bbox
 * true if bbox is inside world boundaries
 */
export function isLonLat(bbox) {
  const [x0, y0, x1, y1] = bbox;
  return x0 >= -180 && x1 <= 180 && y0 >= -90 && y1 <= 90 ? true : false;
}

/**
 * Check if topojson use planar coordinates
 */
export function isPlanar(topo) {
  if (topo.proj === undefined) return !isLonLat(getBbox(topo));

  return topo.proj === "+proj=longlat +datum=WGS84" ? false : true;
}
