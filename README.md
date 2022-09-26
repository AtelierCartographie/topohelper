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
#### from(topojson)
Instantiate a topohelper class of a topojson.   
Before a deep copy of the topojson is made.
```
topohelper.from(topojson_file)
```

#### fromGeojson(geojson)
Instantiate a topohelper class from a geojson or an array of geojson.   
Before inputs are convert to a single topojson.
+ options.**name** `{String|String[]}` - name of the new layer

### Operations
#### lines(options)
Convert to a single MultiLineString a topojson or a topojson geometry object.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index), if "all", all layers are used. Default: last layer created or first layer on first opeartion
+ options.**name** `{String}` - name of the new layer; default: operation name "lines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .lines()
```

#### innerlines(options)
Keep share arcs of adjacent Polygon|MultiPolygon as a single MultiLineString.   
A group by a property can be applied at the same time.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**group** `{String}` - group by a data property before
+ options.**name** `{String}` - name of the new layer; default: operation name "innerlines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .innerlines({group: "property_name"})
```

#### outerlines(options)
Remove share arcs of adjacent Polygon|MultiPolygon and transform the rest as a single MultiLineString.   
Point and MultiPoint geometry object are ignore.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**name** `{String}` - name of the new layer; default: operation name "outerlines"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .outerlines()
```

#### merge(options)
Union all Polygon|MultiPolygon of a layer. Share arcs of adjacent Polygon|MultiPolygon are removed.   
A group by a property can be applied at the same time.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**group** `{String}` - group by a data property before
+ options.**name** `{String}` - name of the new layer; default: operation name "merge"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .merge({group: "property_name"})
```

#### filter(options)
Filter a topojson on a condition. The condition function expose geometry object (`type` and `arcs`) and his `properties` if any.
+ options.**layer** `{String|Number}` - a single target layer (name or index); default: last layer created or first layer on first opeartion
+ options.**condition** `{Function}` - function or arrow function.
+ options.**name** `{String}` - name of the new layer; default: operation name "filter"
+ options.**addLayer** `{Boolean}` - if `true` add a layer to existing ones; default: `true`

```
topohelper.from(topojson_file)
          .filter({condition: d => d.properties.dep == "76"})
```

#### centroids(options)
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

#### simplify(options)
Simplify all layers of a topojson. Intensity of simplification is control by the `level` option.
+ options.**level** `{Number}` - a level of simplification between 0 and 1. 1 = no simplification, 0 = maximum. Default 0.5

```
topohelper.from(topojson_file)
          .simplify({level: 0.3})
```

### Preview
#### view(options)
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
#### toTopojson(options)
Convert a topohelper topojson to a classic topojson with option to select layers and quantize result (good size reduction).
+ options.**layer** `{String[]|Number[]}` - targets layers (name or index). If omit or `"all"` use all layers.
+ options.**q** `{Boolean|Number}` - level of quantization. if `true` quantization is applied with a value of 1e4. Default: `true`.

```
topohelper.from(topojson_file)
          .innerlines()
          .toTopojson({layer: "innerlines}) // export a single layer
```

#### toGeojson(options)
Convert a topohelper topojson to a geojson or an array of geojson.
+ options.**layer** `{String[]|Number[]}` - targets layers (name or index). If omit or `"all"` use all layers.

```
topohelper.from(topojson_file)
          .innerlines()
          .centroids({layer: 0})
          .toGeojson() // export all layers as an array of geojson
```