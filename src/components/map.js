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
    window.mymap = this.map

    fetch('https://api.mapbox.com/styles/v1/mushon/cijzh8i5u0101bmkvm2sxj5l0?access_token=pk.eyJ1IjoibXVzaG9uIiwiYSI6IjY1bHhhTkEifQ.DhW2zcurHHBtmnc2FsMBqg')
      .then(response =>
        response.json()
      )
      .then(json =>
        window.s1 = json
      )

    fetch('https://api.mapbox.com/styles/v1/mushon/cil109hzx001ztylz9akdzee9?access_token=pk.eyJ1IjoibXVzaG9uIiwiYSI6IjY1bHhhTkEifQ.DhW2zcurHHBtmnc2FsMBqg')
      .then(response =>
        response.json()
      )
      .then(json => {
        window.s2 = json
        setTimeout(function() {
          for (let i in window.s1.layers) {
            for (let [k1, v1] of Object.entries(window.s1.layers[i].paint)) {
              const v2 = window.s2.layers[i].paint[k1]
              window.mymap.setPaintProperty(window.s1.layers[i].id, k1, v2)
            }
            for (let [k1, v1] of Object.entries(window.s1.layers[i].layout)) {
              const v2 = window.s2.layers[i].layout[k1]
              window.mymap.setLayoutProperty(window.s1.layers[i].id, k1, v2)
            }
          }
        }, 10000)
      })
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
        'cluster': true,
        'clusterMaxZoom': 14
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

      this.map.addLayer({
        'id': 'clusters',
        'type': 'circle',
        'source': 'eventMarkers',
        'paint': {
          'circle-color': '#2dc6e0',
          'circle-opacity': 0.85,
          'circle-radius': 10
        },
        'filter': ['>', 'point_count', 1]
      });

      this.map.addLayer({
        'id': 'cluster-count',
        'type': 'symbol',
        'source': 'eventMarkers',
        'layout': {
          'text-field': '{point_count}',
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold'
          ],
          'text-size': 11
        },
        'paint': {
          'text-color': '#ffffff'
        }
      });

      this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'top'
      })
      this.hovering = false

      this.map.on('mousemove', (e) => {
        this.map.featuresAt(e.point, {layer: 'markers', radius: 7, includeGeometry: true}, (err, features) => {
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
              .setHTML('<div class="marker-popup">' +
                '<div class="icon"><img src="' + features[0].properties.icon + '"></div>' +
                '<div class="connector"></div>' +
                '<div class="dot"></div>' +
                '</div>')
              .addTo(this.map)

            // fugly hack to grab the click on the popup
            this.popup._content.onclick = (_e) => {
              const featureIds = features.map((e) => e.properties.evid)
              this.props.openEventSidepane(this.props.events.items.filter(
                (ev) => featureIds.includes(ev.id)
              ))
            }

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
