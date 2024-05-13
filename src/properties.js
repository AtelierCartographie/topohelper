import { getLayerName } from "./helpers/layers";

/**
 * Manipulate properties of a topojson layer
 * Four types of operations are available: select, rename, derive and join.
 *
 * @param {TopoJSON} topo - A valid topojson object
 * @param {Object} options - optional parameters
 * @param {Boolean} options.chain - intern option to know if function is called in chained mode
 * @param {String|Number} options.layer - a single target layer (name or index)
 * @param {String|String[]} options.select - parameter of arquero 'select' verb
 * @param {Object} options.rename - ex: {oldColumn: "newColumn"}
 * @param {Object} options.derive - ex: {newColumn: (d) => d.oldColumn + 1}
 * @param {Object} options.join - The join operation to be performed. It should have the following properties:
 *                               - data: The data array to join with the layer properties.
 *                               - on: The key(s) to use for the join. It can be a string or an array of strings.
 *                                     If a string is provided, it will be used for both the id and joined_id.
 *                                     If an array is provided, the first element will be used for the id and the second element will be used for the joined_id.
 * @returns {TopoJSON}
 */
export function properties(topo, options = {}) {
  let { chain, layer, select, rename, derive, join } = options;
  layer = getLayerName(topo, layer, { chain });

  // Handle operation order
  delete options.chain;
  delete options.layer;
  const order = Object.keys(options);

  if (order.includes("join")) {
    const { data, on } = join;
    join.lookup = get_join_lookup(data, on);
  }

  const op_lookup = new Map([
    ["select", (obj) => select_keys(obj, select)],
    ["rename", (obj) => rename_keys(obj, rename)],
    ["derive", (obj) => derive_keys(obj, derive)],
    ["join", (obj) => join_keys(obj, join)],
  ]);

  const op_in_order = order.map((d) => op_lookup.get(d));

  // Process properties in operations order
  const geom = topo.objects[layer].geometries;
  geom.forEach((d, i) => {
    geom[i] = {
      ...d,
      properties: process_properties(d.properties, op_in_order),
    };
  });

  return topo;
}

/**
 * Selects specific properties from an object and returns a new object containing only those properties.
 *
 * @param {object} obj - The object from which to select properties.
 * @param {string|string[]} properties - The properties to select. Can be a single property or an array of properties. Ex: "column1" or ["column1", "column2"]
 * @returns {object} - A new object containing only the selected properties.
 */
function select_keys(obj, properties) {
  if (typeof properties === "string") {
    properties = [properties];
  }
  return properties.reduce((newObj, prop) => {
    if (obj.hasOwnProperty(prop)) {
      newObj[prop] = obj[prop];
    }
    return newObj;
  }, {});
}

/**
 * Renames the keys of an object based on a provided key map.
 *
 * @param {Object} obj - The object whose keys need to be renamed.
 * @param {Object} keyMap - The key map object that maps old keys to new keys. Ex: {oldColumn: "newColumn"}
 * @returns {Object} - A new object with the renamed keys.
 */
function rename_keys(obj, keyMap) {
  const keys = Object.keys(obj);
  return keys.reduce((newObj, key) => {
    const newKey = keyMap[key] || key;
    newObj[newKey] = obj[key];
    return newObj;
  }, {});
}

/**
 * Derives new keys for an object based on a key map.
 *
 * @param {Object} obj - The object to derive keys from.
 * @param {Object} keyMap - The key map object that defines the new keys. Ex: {newColumn: (d) => d.oldColumn + 1}
 * @returns {Object} - The object with the derived keys.
 */
function derive_keys(obj, keyMap) {
  return Object.keys(keyMap).reduce((newObj, key) => {
    newObj[key] = keyMap[key](obj);
    return newObj;
  }, obj);
}

/**
 * Creates a lookup map based on the provided data and keys.
 *
 * @param {Array} data - The data array to create the lookup from.
 * @param {string|Array} keys - The keys to use for the lookup. If a string is provided, it will be used for both the id and joined_id.
 *                              If an array is provided, the first element will be used for the id and the second element will be used for the joined_id.
 * @returns {Map} - The lookup map.
 */
function get_join_lookup(data, keys) {
  if (typeof keys === "string") {
    keys = [keys, keys];
  }
  const [id, joined_id] = keys;
  const lookup = new Map(
    data.map(({ [joined_id]: j_id, ...rest }) => [j_id, rest])
  );

  return lookup;
}

/**
 * Joins the keys of an object with the values from a lookup map based on a specified source ID.
 *
 * @param {Object} obj - The original source object.
 * @param {Map} lookup - The lookup map containing the values to join with the keys.
 * @param {string} source_id - The source ID used to retrieve the values from the lookup map.
 * @returns {Object} - An object with the original keys from `obj` and the corresponding values from `lookup`.
 */
function join_keys(obj, join_options) {
  const { lookup, on } = join_options;
  const source_id = on[0];
  return { ...obj, ...lookup.get(obj[source_id]) };
}

/**
 * Processes the properties of an object using the provided operations.
 * Each operation use the result of the previous one.
 *
 * @param {Object} obj - The object whose properties will be processed.
 * @param {Array<Function>} operations - An array of functions representing the operations to be applied to the properties.
 * @returns {Object} - The object with the processed properties.
 */
function process_properties(obj, operations) {
  return operations.reduce((result, operation) => {
    return operation(result);
  }, obj);
}
