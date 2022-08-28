import { from } from './format/fromTopojson.js'
import { fromGeojson } from './format/fromGeojson.js'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './helpers/toTopojson.js'
import { lines } from './lines.js'
import { innerlines } from './innerlines.js'
import { outerlines } from './outerlines.js'
import { merge } from './merge.js'
import { filter } from './filter.js'
import { view } from './view.js'


export class topohelper {
    constructor(topo) {
      this.topojson = topo;
      this.method = []
    }

    // Instantiate a topohelper class from a topojson or geojson
    static from(topo) {
        return from(topo)
      }
    
    static fromGeojson(geojson) {
        return fromGeojson(geojson)
    }
  
    toGeojson() {
      return toGeojson(this.topojson)
    }
  
    lines(options = {}) {
      this.topojson = lines(this.topojson, options)
      this.method.push({lines: options})
      return this
    }
  
    outerlines(options = {}) {
      this.topojson = outerlines(this.topojson, options)
      this.method.push({outerlines: options})
      return this
    }
  
    innerlines(options = {}) {
      this.topojson = innerlines(this.topojson, options)
      this.method.push({innerlines: options})
      return this
    }
  
    merge(options = {}) {
      this.topojson = merge(this.topojson, options)
      this.method.push({merge: options})
      return this
    }
  
    filter(options = {}) {
      this.topojson = filter(this.topojson, options)
      this.method.push({filter: options})
      return this
    }

    view(options = {}) {
      return view(this.topojson, options)
    }
  
    // centroids(options = {}) {
    //   return centroids(this.topojson, options)
    // }
  
    
  }