# topohelper
TopoJSON Helper is a javascript library that will help you manipulate topoJSON with ease. From a geoJSON or a topoJSON, apply precise operations to take full advantage of this great format.

## Install
`import topohelper from 'topohelper'`

## Build Instructions
To build and develop topohelper locally:
+ `git clone https://github.com/AtelierCartographie/topohelper.git`
+ Run `pnpm install` to install dependencies for all packages.
+ Run `pnpm build`


## Usage

## Docs
### Import geofile (topojson or geojson)
#### from(topojson) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/format/fromTopojson.js)
Instantiate a topohelper class of a topojson.   
Before a deep copy of the topojson is made.
```
topohelper.from(topojson_file)
```

#### fromGeojson(geojson) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/format/fromGeojson.js)
Instantiate a topohelper class from a geojson or an array of geojson.   
Before inputs are convert to a single topojson.
+ options.**name** `{String|String[]}` - name of the new layer

### Operations
#### lines(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/lines.js)
Convert to a single MultiLineString a topojson or a topojson geometry object.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index), if "all", all layers are used. Default: last layer created or first layer on first opeartion
+ options.**name** `{String}` - name of the new layer; default: operation name "lines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .lines()
```

#### innerlines(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/innerlines.js)
Keep share arcs of adjacent Polygon|MultiPolygon as a single MultiLineString.   
A group by a property can be applied at the same time.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**groupby** `{String}` - group by a data property before
+ options.**name** `{String}` - name of the new layer; default: operation name "innerlines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .innerlines({groupby: "property_name"})
```

#### outerlines(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/outerlines.js)
Remove share arcs of adjacent Polygon|MultiPolygon and transform the rest as a single MultiLineString.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**name** `{String}` - name of the new layer; default: operation name "outerlines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .outerlines()
```

#### merge(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/merge.js)
Union all Polygon|MultiPolygon of a layer. Share arcs of adjacent Polygon|MultiPolygon are removed.   
A group by a property can be applied at the same time.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**groupby** `{String}` - group by a data property before
+ options.**rollup** `{Object}` - aggregate properties in conjunction with the group by. ex: `{newCol1: aq.op.count(), newCol2: d => aq.op.sum(d.pop) / 1000, newCol3: aq.op.mean('pop')}`.See [arquero 'rollup()' docs](https://uwdata.github.io/arquero/api/verbs#rollup)
+ options.**join** `{Object}` - Join left an external table (array of objects or arquero table) after merging geometry. ex: `{'data': 'table', on: 'id', value: 'newCol'}`.See [arquero 'join_left()' docs](https://uwdata.github.io/arquero/api/verbs#join_left)
+ options.**name** `{String}` - name of the new layer; default: operation name "merge"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .merge({
            groupby: "property_name",
            rollup: {sum: aq.op.sum("property_name")}
          })
```

#### filter(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/filter.js)
Filter a topojson on a condition. The condition function expose geometry object (`type` and `arcs`) and his `properties` if any.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**condition** `{Function}` - function or arrow function.
+ options.**name** `{String}` - name of the new layer; default: operation name "filter"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .filter({condition: d => d.properties.dep == "76"})
```

#### centroids(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/centroids.js)
Get centroids of each Polygon|MultiPolygon of a topojson layer.   
Point|MultiPoint and LineString|MultiLineString geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**name** `{String}` - name of the new layer; default: operation name "centroids"
+ options.**addLayer** `{Boolean}` - true add a layer to existing ones
+ options.**better** `{Boolean}` - if `true` calcul a pole of inaccessibility instead of a centroid; default: `false`

```
topohelper.from(topojson_file)
          .centroids({layer: 0})
```

#### simplify(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/simplify.js)
Simplify all layers of a topojson. Intensity of simplification is control by the `level` option.
+ options.**level** `{Number}` - a level of simplification between 0 and 1. 1 = no simplification, 0 = maximum. Default 0.5

```
topohelper.from(topojson_file)
          .simplify({level: 0.3})
```

#### properties(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/properties.js)
Manipulate properties of a topojson layer with Arquero.   
Only four arquero verbs are available: select, rename, derive and join.   
Manipulation order of the three verbs respect options object order. `{select, rename}` ≠ `{rename, select}`
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**select** `{String|String[]}` - Select properties to keep. See [arquero 'select()' docs](https://uwdata.github.io/arquero/api/verbs#select)
+ options.**rename** `{Object}` - Rename some or all properties. ex: `{'oldName': 'newName'}`. See [arquero 'rename()' docs](https://uwdata.github.io/arquero/api/verbs#rename)
+ options.**derive** `{Object}` - Add or modify properties. See [arquero 'derive()' docs](https://uwdata.github.io/arquero/api/verbs#derive)
+ options.**join** `{Object}` - Join left an external table (array of objects or arquero table). ex: `{'data': 'table', on: 'id', value: 'newCol'}`.See [arquero 'join_left()' docs](https://uwdata.github.io/arquero/api/verbs#join_left)

```
topohelper.from(topojson_file)
          .properties({
            select: ["ID", "POPULATION"],
            rename: {ID: "id", POPULATION: "pop"},
            derive: {pop1000: d => d.pop / 1000}
          })
```

### Preview
#### view(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/view.js)
Preview a topojson in Canvas. Zoom and tooltip are built in as option.   
Multiple layers can be shown at the same time.
+ options.**layer** `{String[]|Number[]}` - one or several layer (name or index). If `"last"`, render the last layer created. If omit or `"all"` render all layers. Default: `"all"`.
+ options.**zoom** `{Boolean}` - if `true` add a tooltip; default: `false`
+ options.**tooltip** `{Boolean}` - if `true` add a tooltip; default: `false`
+ options.**size** `{Number[]}` - canvas dimensions as [width, height]

```
topohelper.from(topojson_file)
          .view({zoom: true})
```

### Export
#### toTopojson(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/format/toTopojson.js)
Convert a topohelper topojson to a classic topojson with option to select layers and quantize result (good size reduction).
+ options.**layer** `{String[]|Number[]}` - targets layers (name or index). If omit or `"all"` use all layers.
+ options.**q** `{Boolean|Number}` - level of quantization. if `true` quantization is applied with a value of 1e4. Default: `true`.

```
topohelper.from(topojson_file)
          .innerlines()
          .toTopojson({layer: "innerlines}) // export a single layer
```

#### toGeojson(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/format/toGeojson.js)
Convert a topohelper topojson to a geojson or an array of geojson.
+ options.**layer** `{String[]|Number[]}` - targets layers (name or index). If omit or `"all"` use all layers.

```
topohelper.from(topojson_file)
          .innerlines()
          .centroids({layer: 0})
          .toGeojson() // export all layers as an array of geojson
```

#### toObjects(options) - [source](https://github.com/AtelierCartographie/topohelper/blob/main/src/format/toObjects.js)
Export properties of a layer.
+ options.**layer** `{String[]|Number[]}` - target layer (name or index).

```
topohelper.from(topojson_file)
          .toObjects()
```