import { fromTopojson } from './format/fromTopojson.js'
import { fromGeojson } from './format/fromGeojson.js'
import { toGeojson } from './format/toGeojson.js'
import { toTopojson } from './format/toTopojson.js'
import { toObjects } from './format/toObjects.js'
import { lines } from './lines.js'
import { innerlines } from './innerlines.js'
import { outerlines } from './outerlines.js'
import { merge } from './merge.js'
import { filter } from './filter.js'
import { centroids } from './centroids.js'
import { simplify } from './simplify.js'
import { properties } from './properties.js'
import { info } from './info.js'
// import { project } from './project.js'
import { view } from './view.js'


export class topohelper {
    constructor(topo) {
      this.topojson = topo;
      this.method = []
    }

    // Instantiate a topohelper class from a topojson or geojson
    static from(topo) {
      return fromTopojson(topo)
    }
    
    static fromGeojson(geojson, options = {}) {
      return fromGeojson(geojson, options)
    }
  
    toGeojson(options = {}) {
      return toGeojson(this.topojson, options)
    }

    toTopojson(options = {}) {
      return toTopojson(this.topojson, options)
    }

    toObjects(options = {}) {
      return toObjects(this.topojson, {...options, chain: true})
    }
  
    lines(options = {}) {
      this.topojson = lines(this.topojson, {...options, chain: true})
      this.method.push({lines: options})
      return this
    }
  
    outerlines(options = {}) {
      this.topojson = outerlines(this.topojson, {...options, chain: true})
      this.method.push({outerlines: options})
      return this
    }
  
    innerlines(options = {}) {
      this.topojson = innerlines(this.topojson, {...options, chain: true})
      this.method.push({innerlines: options})
      return this
    }
  
    merge(options = {}) {
      this.topojson = merge(this.topojson, {...options, chain: true})
      this.method.push({merge: options})
      return this
    }
  
    filter(options = {}) {
      this.topojson = filter(this.topojson, {...options, chain: true})
      this.method.push({filter: options})
      return this
    }

    centroids(options = {}) {
      this.topojson = centroids(this.topojson, {...options, chain: true})
      this.method.push({centroids: options})
      return this
    }

    simplify(options = {}) {
      this.topojson = simplify(this.topojson, {...options, chain: true})
      this.method.push({simplify: options})
      return this
    }

    properties(options = {}) {
      this.topojson = properties(this.topojson, {...options, chain: true})
      this.method.push({properties: options})
      return this
    }

    info() {
      return info(this.topojson)
    }

    // project(options = {}) {
    //   this.topojson = project(this.topojson, {...options, chain: true})
    //   this.method.push({project: options})
    //   return this
    // }

    view(options = {}) {
      return view(this.topojson, {...options, chain: true})
    }
    
  }