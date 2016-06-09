import React from 'react'

import appconf from '../../config/client'

import mapboxgl from 'mapbox-gl'

const OPACITY_DICT = {
  'background': ['background-opacity'],
  'fill': ['fill-opacity'],
  'line': ['line-opacity'],
  'symbol': ['icon-opacity', 'text-opacity'],
  'raster': ['raster-opacity'],
  'circle': ['circle-opacity']
}

function getEventStyle (ev) {
  if (ev.start_date < '1789-')  // vive la revolution
    return 'preindustrial'
  else
    return 'default'
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
      shrink: 'noshrink'
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

  addSingleLineLayer(evid, name, pattern) {
    const annotations = this.props.annotations.items.filter(a => a.events.includes(evid)).filter(a => a.type == name)

    const allevs = this.props.events
    const anns = annotations.map(a => {
      let evs = a.events
      if (a.events[0] != a.origin)
        evs = evs.reverse()

      const evcoords = evs.map(e => allevs.items.find(ev => ev.id == e).place.position.split(',').map(x => +x).reverse())
      return {
        'type': 'Feature',
        'properties': {
          'description': 'test'
        },
        'geometry': {
          'type': 'LineString',
          'coordinates': evcoords
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

  addSingleMarkerLayer(evid, name, icon) {
    const annotations = this.props.annotations.items.filter(a => a.events.includes(evid)).filter(a => a.type == name)

    const allevs = this.props.events
    const anns = annotations.map(a => {
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

  addAnnotations (evid) {
    this.addSingleLineLayer(evid, 'reference', 'ann_origin')
    this.addSingleLineLayer(evid, 'path', 'ann_travel')
    this.addSingleLineLayer(evid, 'communication', 'ann_communication')
    this.addSingleMarkerLayer(evid, 'group', 'grouped-marker')
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

    let placeMapping = {}
    this.props.events.items.map((ev, index) => {
      if (!placeMapping[ev.place.id])
        placeMapping[ev.place.id] = []
      placeMapping[ev.place.id].push(ev.id)
    })

    const markerData = {
      'type': 'FeatureCollection',
      'features': this.props.events.items.map((ev, index) => {
        return {
          'type': 'Feature',
          'properties': {
            'description': ev.title,
            'evid': ev.id,
            'icon': ev.icon,
            'marker-symbol': 'default-marker'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': ev.place.position.split(',').map(x => +x).reverse()
          }
        }
      })
    }

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
          .setHTML('<div class="marker-popup">' +
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
      .setHTML('<div class="marker-popup">' +
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
        this.addAnnotations(ev.id)
      }
      else {
       this.map.flyTo({ center: coords })
      }

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
    let shrink = 'noshrink'
    if (props.app.selected.length > 0) {
      shrink = 'shrink'
    }
    this.setState(Object.assign({}, this.state, { shrink: shrink }))
  }

  componentDidUpdate (prevProps, _prevState) {
    if (!this.props.events.fetching && !this.markers && this.props.events.items.length > 0) {
      this.initMap()
    }

    this.checkSelectAndHover('select', this.props.app.origin, prevProps.app.selected, this.props.app.selected)
    this.checkSelectAndHover('hover', this.props.app.origin, prevProps.app.hover, this.props.app.hover)

    if (!this.resized && this.map) {
      // trigger resize as long as we haven't completed map init yet
      this.map.resize()
    }

  }

  componentWillUnmount () {
    this.map.remove()
  }

  render () {
    return <div id='map-container' className={this.state.shrink}>
      <h1 className='title'>Where & When of Jewish Culture</h1>
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
    </div>
  }

}

class Map extends React.Component {
  render () {
    const view = { style: 'mapbox://styles/mushon/cimez8r6k00plbolzpmeovm8l', center: [35, 31], zoom: 3, container: 'map' }
    return <GLMap view={view} token={appconf.token.map} app={this.props.app}
      events={this.props.events} annotations={this.props.annotations}
      hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent}
      selectEvent={this.props.selectEvent} deselectEvent={this.props.deselectEvent} setAppStyle={this.props.setAppStyle} />
  }
}

export default Map
