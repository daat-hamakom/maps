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
    view: React.PropTypes.object,  // default map view
    token: React.PropTypes.string  // mapbox auth token
  }

  componentDidMount () {
    mapboxgl.accessToken = this.props.token
    this.map = new mapboxgl.Map(this.props.view)
  }

  componentDidUpdate() {
    console.log(this.props.markers)
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
    const view = { style: 'mapbox://styles/mapbox/light-v8', center: [35, 31], zoom: 7, container: 'map' }
    return <GLMap view={view} token={appconf.token.map}/>
  }
}

export default Map
