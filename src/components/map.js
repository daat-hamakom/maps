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

  componentDidMount () {
    mapboxgl.accessToken = this.props.token
    this.map = new mapboxgl.Map(this.props.view)
    this.markers = false
  }

  componentDidUpdate () {
    if (!this.props.events.fetching && !this.markers) {
      const markers = {
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

      this.map.addSource('markers', {
        'type': 'geojson',
        'data': markers,
        'cluster': false
      })

      this.map.addLayer({
        'id': 'markers',
        'type': 'symbol',
        'source': 'markers',
        'interactive': true,
        'layout': {
          'icon-image': '{marker-symbol}',
          'text-field': '{point_count}'
        },
        'paint': {
          'text-size': 12
        }
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

        });
      })

      this.markers = true
    }
  }

  componentWillUnmount () {
    this.map.remove()
  }

  render () {
    return <div id='map'></div>
  }

}

class Map extends React.Component {
  render () {
    const view = { style: 'mapbox://styles/mapbox/light-v8', center: [35, 31], zoom: 3, container: 'map' }
    return <GLMap view={view} token={appconf.token.map} events={this.props.events}
      openEventSidepane={this.props.openEventSidepane} />
  }
}

export default Map
