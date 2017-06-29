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

      const evcoords = evs.map(e => allevs.find(ev => ev.id == e).place.position.split(',').map(x => +x).reverse())
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
      const evcoords = a.events.map(e => allevs.find(ev => ev.id == e).place.position.split(',').map(x => +x).reverse())

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
    let _uniq_cache = []
    const places = this.props.events.map(e => {
      const cacheName = e.place.name.split(',')[0] + ' ' + getEventStyle(e)
      if (_uniq_cache.indexOf(cacheName) > -1)
        return null
      else
        _uniq_cache.push(cacheName)

      return {
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
      }
    }).filter(e => e != null)

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

  getMarkerData () {
    return {
      'type': 'FeatureCollection',
      'features': this.props.events.map((ev, index) => {
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
  }

  initMap() {
    this.markers = true

    var sourceObj = new mapboxgl.GeoJSONSource({
      'data': this.getMarkerData(),
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

        this.props.hoverEnterEvent(this.props.events.filter(
          (ev) => featureIds.includes(ev.id)
        ))

        const router = this.context.router

        // fugly hack to grab the click on the popup
        this.hover_popup._content.onclick = (_e) => {
          this.props.selectEvent(this.props.events.filter(
            (ev) => featureIds.includes(ev.id)
          ))
          if (featureIds.length == 1) {
            let url = '/event/' + featureIds[0]
            if (this.props.params.projId) {
              url = 'project/' + this.props.params.projId + '/' + url
            }
            else if (this.props.params.personId) {
              url = 'person/' + this.props.params.personId + '/' + url
            }
            else if (this.props.params.orgId) {
              url = 'organization/' + this.props.params.orgId + '/' + url
            }
            else if (this.props.params.tagName) {
              url = 'tag/' + encodeURIComponent(this.props.params.tagName) + '/' + url
            }
            else if (this.props.params.placeId) {
              url = 'place/' + encodeURIComponent(this.props.params.placeId) + '/' + url
            }
            router.push(url)
          }
          this.props.hoverExitEvent()
        }
      }
    })

    this.map.on('mousedown', (e) => {
      if (this.props.app.drawer && (this.props.params.projectId ||
          this.props.params.personId || this.props.params.orgId)) {
        this.props.toggleDrawer()
      }
    })

    this.switchLayers('default', true)

    // final resize attempt
    this.map.resize()
    this.resized = true
  }

  updateMarkers () {
    this.map.getSource('eventMarkers').setData(this.getMarkerData())
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

    const coords = ev.place.position.split(',').map(x => +x).reverse();
    popup.setLngLat(coords)
      .setHTML('<div class="marker-popup ' + getEventStyle(ev) + '">' +
        '<div class="icon"><img src="' + ev.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_s.jpg' + '"></div>' +
        '<div class="connector"></div>' +
        '<div class="dot"></div>' +
        '</div>')
      .addTo(this.map)

    if (t == 'select') {
      const zoomMap = {
        'world': 1,
        'continent': 3,
        'country': 6,
        'metropolis': 9,
        'province': 10,
        'largecity': 11,
        'city': 12,
        'site': 14,
        'neighbourhood': 16
      };
      let zoom;

      if (ev.map_context) {
        zoom = zoomMap[ev.map_context] ;

        this.map.resize();
        this.map.flyTo({ center: coords, zoom: zoom });
      }
      else if (ev.place && ev.place.zoomlevel){
        zoom = zoomMap[ev.place.zoomlevel] ;

        this.map.resize();
        this.map.flyTo({ center: coords, zoom: zoom });
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

  zoomMapByEvents (events, params) {
    const zoomMap = {
      'world': 1,
      'continent': 3,
      'country': 6,
      'metropolis': 9,
      'province': 10,
      'largecity': 11,
      'city': 12,
      'site': 14,
      'neighbourhood': 16
    };

    // handle case of single event
    if (params.eventId) {
      events = events.filter(e => e.id == params.eventId);
      if (!events.length) return;
    } else {
      if (events.length > 500) {
        this.map.flyTo({ zoom: 2 });
        return;
      }
    }

    let places = events.map((e) => e.place ).filter(p => p != null);
    if (!places.length) return;
    const placesIds = places.map((p) => p.id );

    const lang = places.map((p) => p.position.split(',')[0]).sort((a,b) => a - b);
    const lat = places.map((p) => p.position.split(',')[1]).sort((a,b) => a - b);

    const centerLang = lang.length > 2 ? lang[Math.floor(lang.length/2)] : (parseFloat(lang[lang.length-1]) + parseFloat(lang[0])) / 2;
    const diffLang =  lang[lang.length-1] - lang[0];

    const centerLat = lat.length > 2 ? lat[Math.floor(lat.length/2)] : (parseFloat(lat[lat.length-1]) + parseFloat(lat[0])) / 2;
    const diffLat = lat[lat.length-1] - lat[0];

    const maxDiff = Math.max.apply(null, [diffLang, diffLat]);

    console.log('diff' ,maxDiff);
    let zoom = 16;
    if (maxDiff > 200) {
      zoom = 1;
    }
    else if (maxDiff > 100) {
      zoom = 2;
    }
    else if (maxDiff > 20) {
      zoom = 3;
    }
    else if (maxDiff > 15) {
      zoom = 4;
    }
    else if (maxDiff > 10) {
      zoom = 6;
    }
    else if (maxDiff > 5) {
      zoom = 8;
    }
    else if (maxDiff > 1) {
      zoom = 9;
    }
    else if (maxDiff > 0.4) {
      zoom = 10;
    }
    else if (maxDiff > 0.1) {
      zoom = 12;
    }

    if (placesIds.length === 1) {
      const eventZoom = params.eventId && events[0].map_context;
      const minZoom = zoomMap[ eventZoom || places[0].zoomlevel];
      zoom = Math.min(minZoom, zoom);
    }

    const center = [centerLang, centerLat].map(x => +x).reverse();

    this.map.resize();

    if (centerLang && centerLat && zoom) {
      this.map.flyTo({ center: center, zoom: zoom })
    }
  }

  componentWillReceiveProps (props) {
    // check if an event is selected to we can shrink the map
    const { app, params } = props;

    let hshrink = 'nohshrink'
    if (app.selected.length > 0) {
      hshrink = 'hshrink'
    }
    this.setState(Object.assign({}, this.state, { hshrink: hshrink }))

    let vshrink = 'novshrink'
    if ((params.projId || params.personId || params.orgId  || params.placeId ) && app.drawer) {
      vshrink = 'vshrink'
    }
    this.setState(Object.assign({}, this.state, { vshrink: vshrink }))
    this.triggerResize = true
  }

  componentDidUpdate (prevProps, _prevState) {
    const { app, params, events } = this.props;
    const prevParams = prevProps.params;


    if (!this.markers && events.length > 0) {
      this.initMap()
    }

    if (this.markers && events.length != prevProps.events.length) {
      // for simplicity, we assume that length checks are enough here
      // if two prop updates actually happened and length are same then we'll skip an update and hit a bug
      this.updateMarkers()
    }

    this.checkSelectAndHover('select', app.origin, prevProps.app.selected, app.selected);
    this.checkSelectAndHover('hover', app.origin, prevProps.app.hover, app.hover);

    if ((!this.resized && this.map) || this.triggerResize) {
      // trigger resize as long as we haven't completed map init yet
      this.map.resize();
      this.triggerResize = false
    }


    delete prevParams['eventId'];
    let zoomCondition = (JSON.stringify(params) !== JSON.stringify(prevParams) );
    if ( zoomCondition ) this.zoomMapByEvents(events, params);

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
          <li onClick={(e) => { this.map.flyTo({zoom: this.map.getZoom() + 1}) }} className="control-container" >
            +
          </li>
          <li onClick={(e) => { this.map.flyTo({zoom: this.map.getZoom() - 1}) }} className="control-container" >
            &ndash;
          </li>
        </ul>
      </div>
      <div id='map-credit'>
        <a href="http://www.daat-hamakom.com/" target="blank" title="Daat Hamakom—I-Core In The Study of Modern Jewish Culture">Daat Hamakom</a>
      </div>
    </div>
  }

}

GLMap.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

class Map extends React.Component {

  render () {
    const view = { style: 'mapbox://styles/mushon/ciqg8f3lv000re0nfv8j3hxjd', center: [35, 31], zoom: 3, container: 'map' }
    return <GLMap view={view} token={appconf.token.map} app={this.props.app} params={this.props.params}
      events={this.props.events} annotations={this.props.annotations} places={this.props.places}
      hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent}
      selectEvent={this.props.selectEvent} deselectEvent={this.props.deselectEvent} setAppStyle={this.props.setAppStyle}
      toggleDrawer={this.props.toggleDrawer} />
  }
}



export default Map
