import React from 'react'

import { getEventStyle } from './utils'
import appconf from '../../config/client'

// Need to directly script-load instead of proper import since GL JS doesn't support webpack
// import mapboxgl from 'mapbox-gl'
// https://github.com/mapbox/mapbox-gl-js/issues/1649
require('script!mapbox-gl/dist/mapbox-gl.js')
/*global mapboxgl*/

const OPACITY_DICT = {
  'background': ['background-opacity'],
  'fill': ['fill-opacity'],
  'line': ['line-opacity'],
  'symbol': ['icon-opacity', 'text-opacity'],
  'raster': ['raster-opacity'],
  'circle': ['circle-opacity']
}

class GLMap extends React.Component {

  // Adapted from Tim Welch's code that can be found at
  // https://github.com/twelch/react-mapbox-gl-seed/blob/4d78eb0/src/components/GLMap.js

  static propTypes = {
    view: React.PropTypes.object,
    token: React.PropTypes.string,
    events: React.PropTypes.object
  };

  componentWillMount () {
    this.setState({
      rectzoom : false,
      vshrink: 'novshrink',
      hshrink: 'nohshrink'
    })
  }

  switchLayers (layerPrefix, force = false) {

    this.props.setAppStyle(layerPrefix)

    if (this.currentStyle == layerPrefix && !force)
      return

    const markerLayers = ['markers']
    Object.keys(this.map.style._layers).forEach((l) => {

      if (l.startsWith('annotations-')) {
        return
      }

      if (markerLayers.indexOf(l) == -1) {
        const layer = this.map.getLayer(l)
        const oprops = OPACITY_DICT[layer.type]
        const show = l.indexOf(layerPrefix + '-') == 0
        oprops.forEach((p) => {
          let opacity = show ? 1 : 0
          const origval = layer.metadata['orig-' + p]
          if (show && (origval !== undefined)) {
            opacity = origval
          }
          this.map.setPaintProperty(l, p, opacity)
        })
      }

    })
    this.currentStyle = layerPrefix
  }

  addSingleLineLayer(annotations, evid, name, pattern) {
    const allevs = this.props.events
    const anns = annotations.filter(a => a.type == name).map(a => {
      let evs = a.events
      if (a.events[0] != a.origin)
        evs = evs.reverse()

      const evcoords = evs.map(e => allevs.items.find(ev => ev.id == e).place.position.split(',').map(x => +x).reverse())
      const placecoords = a.places.map(p => this.props.places.items.find(pl => pl.id == p).position.split(',').map(x => +x).reverse())

      return {
        'type': 'Feature',
        'properties': {
          'description': 'test'
        },
        'geometry': {
          'type': 'LineString',
          'coordinates': evcoords.concat(placecoords)
        }
      }
    })

    const annotationData = {
      'type': 'FeatureCollection',
      'features': anns
    }

    var annotationSourceObj = new mapboxgl.GeoJSONSource({
      'data': annotationData,
      'cluster': false,
    })

    this.map.addSource('annotations-' + name, annotationSourceObj)

    this.map.addLayer({
      'id': 'annotations-' + name,
      'type': 'line',
      'source': 'annotations-' + name,
      'interactive': true,
      'paint': {
        'line-color': '#000',
        'line-width': 7,
        'line-pattern': pattern
      }
    })
  }

  addSingleMarkerLayer(annotations, evid, name, icon) {
    const allevs = this.props.events
    const anns = annotations.filter(a => a.type == name).map(a => {
      const evcoords = a.events.map(e => allevs.items.find(ev => ev.id == e).place.position.split(',').map(x => +x).reverse())

      return evcoords.map(c => { return {
        'type': 'Feature',
        'properties': {
          'description': 'test',
          'marker-icon': icon
        },
        'geometry': {
          'type': 'Point',
          'coordinates': c
        }
      }})

    })

    const annotationData = {
      'type': 'FeatureCollection',
      'features': anns[0] // we support just one set of groups!
    }

    var annotationSourceObj = new mapboxgl.GeoJSONSource({
      'data': annotationData,
      'cluster': false,
    })

    this.map.addSource('annotations-' + name, annotationSourceObj)

    this.map.addLayer({
      'id': 'annotations-' + name,
      'type': 'symbol',
      'source': 'annotations-' + name,
      'interactive': true,
      'layout': {
        'icon-image': '{marker-icon}',
        'icon-allow-overlap': true
      }
    })
  }

  addAnnotations (evid, period) {
    let annotations = this.props.annotations.items.filter(a => a.events.includes(evid))
    const group = annotations.filter(a => a.type == 'group')

    let evs = [evid]
    if (group.length) {
      evs = group[0].events
    }

    // only show group for the single event
    this.addSingleMarkerLayer(annotations, evid, 'group', period + '-grouped-marker')

    annotations = this.props.annotations.items.filter(a => a.events.filter(x => evs.indexOf(x) > -1).length)
    // for the rest, extend annotations to the group
    this.addSingleLineLayer(annotations, evid, 'reference', period + '-ann_origin')
    this.addSingleLineLayer(annotations, evid, 'path', period + '-ann_travel')
    this.addSingleLineLayer(annotations, evid, 'communication', period + '-ann_communication')
  }

  addPlaceMarkers () {
    const places = this.props.events.items.map(e => { return {
      'type': 'Feature',
      'properties': {
        'title': e.place.name.split(',')[0],
        'zoomlevel': e.place.zoomlevel,
        'period': getEventStyle(e)
      },
      'geometry': {
        'type': 'Point',
        'coordinates': e.place.position.split(',').map(x => +x).reverse()
      }
    }})
    const data = {
      'type': 'FeatureCollection',
      'features': places
    }
    const source = new mapboxgl.GeoJSONSource({ 'data': data })
    this.map.addSource('place-labels', source)
    console.log('places', data)
  }

  removeSingleLayer(name) {
    if (this.map.getLayer(name)) {
      this.map.removeLayer(name)
    }
    if (this.map.getSource(name)) {
      this.map.removeSource(name)
    }
  }

  removeAnnotations () {
    this.removeSingleLayer('annotations-reference')
    this.removeSingleLayer('annotations-path')
    this.removeSingleLayer('annotations-communication')
    this.removeSingleLayer('annotations-group')
  }

  componentDidMount () {
    mapboxgl.accessToken = this.props.token
    this.map = new mapboxgl.Map(this.props.view)
    this.markers = false
    this.resized = false
    this.currentStyle = 'default'
    // this.switchLayers('default')
    window.map = this.map
  }

  initMap() {
    this.markers = true

    const markerData = {
      'type': 'FeatureCollection',
      'features': this.props.events.items.map((ev, index) => {
        const style = getEventStyle(ev)
        return {
          'type': 'Feature',
          'properties': {
            'description': ev.title,
            'evid': ev.id,
            'icon': ev.icon,
            'marker-symbol': style + '-marker',
            'style': style
          },
          'geometry': {
            'type': 'Point',
            'coordinates': ev.place.position.split(',').map(x => +x).reverse()
          }
        }
      })
    }

    console.log('evmarkers', markerData)

    var sourceObj = new mapboxgl.GeoJSONSource({
      'data': markerData,
      'cluster': false,
      'clusterMaxZoom': 5
    })

    this.map.addSource('eventMarkers', sourceObj)

    this.map.addLayer({
      'id': 'markers',
      'type': 'symbol',
      'source': 'eventMarkers',
      'interactive': true,
      'layout': {
        'icon-image': '{marker-symbol}',
        'icon-allow-overlap': true
      }
    })

    this.addPlaceMarkers()

    this.hover_popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'top'
    })

    this.select_popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'top'
    })

    this.hovering = false

    this.map.on('mousemove', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['markers']})
      if (!features.length) {
        if (this.hovering) {
          this.hover_popup.remove()
          this.props.hoverExitEvent()
          this.hovering = false
        }
        return
      }

      if (!this.hovering) {

        if (features[0].properties.cluster) {
          return
        }

        this.hovering = true
        this.hover_popup.setLngLat(features[0].geometry.coordinates)
          .setHTML('<div class="marker-popup ' + features[0].properties.style + '">' +
            '<div class="icon"><img src="' + features[0].properties.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_s.jpg' + '"></div>' +
            '<div class="connector"></div>' +
            '<div class="dot"></div>' +
            '</div>')
          .addTo(this.map)

        const featureIds = features.map((e) => e.properties.evid)

        this.props.hoverEnterEvent(this.props.events.items.filter(
          (ev) => featureIds.includes(ev.id)
        ))

        // fugly hack to grab the click on the popup
        this.hover_popup._content.onclick = (_e) => {
          this.props.selectEvent(this.props.events.items.filter(
            (ev) => featureIds.includes(ev.id)
          ))
          this.props.hoverExitEvent()
        }
      }
    })

    this.map.on('mousedown', (e) => {
      if (this.props.app.proj && this.props.proj) {
        this.props.toggleProj()
      }
    })

    this.switchLayers('default', true)

    // final resize attempt
    this.map.resize()
    this.resized = true

  }

  handleSelected (t, origin) {
    let ev = this.props.app.selected[0]
    let popup = this.select_popup

    if (t == 'hover') {
      ev = this.props.app.hover[0]
      popup = this.hover_popup
    }
    else {
      this.switchLayers(getEventStyle(ev))
    }

    const coords = ev.place.position.split(',').map(x => +x).reverse()
    popup.setLngLat(coords)
      .setHTML('<div class="marker-popup ' + getEventStyle(ev) + '">' +
        '<div class="icon"><img src="' + ev.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_s.jpg' + '"></div>' +
        '<div class="connector"></div>' +
        '<div class="dot"></div>' +
        '</div>')
      .addTo(this.map)

    if (t == 'select') {
      if (ev.map_context) {
        let zoom = {
          'world': 1,
          'continent': 3,
          'country': 6,
          'province': 10,
          'city': 12,
          'neighbourhood': 16
        }[ev.map_context]

        this.map.resize()
        this.map.flyTo({ center: coords, zoom: zoom })
      }
      else {
       this.map.flyTo({ center: coords })
      }
      this.addAnnotations(ev.id, getEventStyle(ev))
    }
  }

  handleDeselected (t) {
    if (t == 'select') {
      this.select_popup.remove()
      this.switchLayers('default')
      this.removeAnnotations()
      this.map.resize()
    }
    else if (t == 'hover')
      this.hover_popup.remove()
  }

  checkSelectAndHover (t, origin, prevProp, nextProp) {
    const prev = prevProp.length
    const next = nextProp.length
    if (prev == 0 && next > 0) {
      this.handleSelected(t, origin)
    }
    else if (prev > 0 && next == 0) {
      this.handleDeselected(t)
    }
    else if (prev > 0 && next > 0 && prevProp[0].id != nextProp[0].id) {
      this.handleDeselected(t)
      this.handleSelected(t, origin)
    }
  }

  componentWillReceiveProps (props) {
    // check if an event is selected to we can shrink the map
    let hshrink = 'nohshrink'
    if (props.app.selected.length > 0) {
      hshrink = 'hshrink'
    }
    this.setState(Object.assign({}, this.state, { hshrink: hshrink }))

    let vshrink = 'novshrink'
    if (props.proj && props.app.proj) {
      vshrink = 'vshrink'
    }
    this.setState(Object.assign({}, this.state, { vshrink: vshrink }))
    this.triggerResize = true
  }

  componentDidUpdate (prevProps, _prevState) {
    if (!this.props.events.fetching && !this.markers && this.props.events.items.length > 0) {
      this.initMap()
    }

    this.checkSelectAndHover('select', this.props.app.origin, prevProps.app.selected, this.props.app.selected)
    this.checkSelectAndHover('hover', this.props.app.origin, prevProps.app.hover, this.props.app.hover)

    if ((!this.resized && this.map) || this.triggerResize) {
      // trigger resize as long as we haven't completed map init yet
      this.map.resize()
      this.triggerResize = false
    }

  }

  componentWillUnmount () {
    this.map.remove()
  }

  render () {
    return <div id='map-container' className={this.state.vshrink + ' ' + this.state.hshrink}>
      <div id="logo">
        <h1 className='title'>Jewish Cultures on the Map</h1>
        <p>Interactive Exploration in Time & Space</p>
      </div>
      <div id='map' className={this.state.rectzoom ? 'rectzoom' : 'norectzoom'} onKeyDown={(e) => {
        if (e.keyCode == 16) this.setState({ rectzoom: true })
      }} onKeyUp={(e) => {
        if (e.keyCode == 16) this.setState({ rectzoom: false })
      }}></div>
      <div id='map-controls'>
        <ul>
          <li onClick={(e) => {
            this.map.flyTo({zoom: this.map.getZoom() + 1})
          }}><img src="/static/img/zoom-in.png"></img></li>
          <li onClick={(e) => {
            this.map.flyTo({zoom: this.map.getZoom() - 1})
          }}><img src="/static/img/zoom-out.png"></img></li>
          <li onClick={(e) => {
            this.map.setBearing(0)
          }}><img src="/static/img/orient-map.png"></img></li>
        </ul>
      </div>
      <div id='map-credit'>
        <a href="http://www.daat-hamakom.com/" target="blank" title="Daat Hamakom—I-Core In The Study of Modern Jewish Culture">Daat Hamakom</a>
      </div>
    </div>
  }

}

class Map extends React.Component {
  render () {
    const view = { style: 'mapbox://styles/mushon/ciqg8f3lv000re0nfv8j3hxjd', center: [35, 31], zoom: 3, container: 'map' }
    return <GLMap view={view} token={appconf.token.map} app={this.props.app} proj={this.props.proj}
      events={this.props.events} annotations={this.props.annotations} places={this.props.places}
      hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent}
      selectEvent={this.props.selectEvent} deselectEvent={this.props.deselectEvent} setAppStyle={this.props.setAppStyle}
      toggleProj={this.props.toggleProj} />
  }
}

export default Map
