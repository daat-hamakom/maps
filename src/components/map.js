import React from 'react'

import appconf from '../../config/client'

// Need to directly script-load instead of proper import since GL JS doesn't support webpack
// https://github.com/mapbox/mapbox-gl-js/issues/1649
require('script!mapbox-gl/dist/mapbox-gl.js')
/*global mapboxgl*/

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
      rectzoom : false
    })
  }

  componentDidMount () {
    mapboxgl.accessToken = this.props.token
    this.map = new mapboxgl.Map(this.props.view)
    this.markers = false
  }

  componentDidUpdate () {
    if (!this.props.events.fetching && !this.markers && this.props.events.items.length > 0) {

      this.markers = true

      const markerData = {
        'type': 'FeatureCollection',
        'features': this.props.events.items.map((ev, index) => {
          return {
            'type': 'Feature',
            'properties': {
              'description': ev.title,
              'evid': ev.id,
              'marker-symbol': 'default_marker'
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
        'cluster': false
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

      this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
      this.hovering = false

      this.map.on('mousemove', (e) => {
        this.map.featuresAt(e.point, {layer: 'markers', radius: 10, includeGeometry: true}, (err, features) => {
          if (err || !features.length) {
            if (this.hovering) {
              this.popup.remove()
              this.props.hoverExitEvent()
              this.hovering = false
            }
            return
          }

          if (!this.hovering) {
            this.hovering = true
            this.popup.setLngLat(features[0].geometry.coordinates)
              .setHTML(features[0].properties.description)
              .addTo(this.map)
            this.props.hoverEnterEvent(features[0].properties.evid)
          }
        })
      })

      this.map.on('click', (e) => {
        this.map.featuresAt(e.point, {
          layer: 'markers', radius: 10, includeGeometry: true
        }, (err, features) => {
          if (err || !features.length)
            return;

          const featureIds = features.map((e) => e.properties.evid)
          this.props.openEventSidepane(this.props.events.items.filter(
            (ev) => featureIds.includes(ev.id)
          ))

        })
      })
    }
  }

  componentWillUnmount () {
    this.map.remove()
  }

  render () {
    return <div id='map' className={this.state.rectzoom ? 'rectzoom' : 'norectzoom'} onKeyDown={(e) => {
      if (e.key = 'Shift') this.setState({ rectzoom: true })
    }} onKeyUp={(e) => {
      if (e.key = 'Shift') this.setState({ rectzoom: false })
    }}></div>
  }

}

class Map extends React.Component {
  render () {
    const view = { style: 'mapbox://styles/mushon/cijzh8i5u0101bmkvm2sxj5l0', center: [35, 31], zoom: 3, container: 'map' }
    return <GLMap view={view} token={appconf.token.map} events={this.props.events}
      openEventSidepane={this.props.openEventSidepane}
      hoverEnterEvent={this.props.hoverEnterEvent}
      hoverExitEvent={this.props.hoverExitEvent} />
  }
}

export default Map
