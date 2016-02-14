import Immutable from 'immutable'
import MapGL from 'react-map-gl'
import rasterTileStyle from 'raster-tile-style'
import React from 'react'

import appconf from '../../config/client'

class Map extends React.Component {

  constructor (props) {
    super(props)
    var tileSource = '//tile.stamen.com/toner/{z}/{x}/{y}.png';
    var mapStyle = Immutable.fromJS(rasterTileStyle([tileSource]));
    this.state = {
      viewport: {
        latitude: 37.78,
        longitude: -122.45,
        zoom: 11,
        width: 800,
        height: 800,
        startDragLngLat: null,
        isDragging: null
      },
      mapStyle: 'mapbox://styles/mapbox/light-v8'
    }
  }

  _onChangeViewport = (newViewport) => {
    var viewport = Object.assign({}, this.state.viewport, newViewport);
    this.setState({viewport});
  };

  render() {
    var {mapStyle, viewport} = this.state;
    return <MapGL
      onChangeViewport={this._onChangeViewport}
      mapStyle={mapStyle}
      mapboxApiAccessToken={appconf.token.map}
      {...viewport} />
  }
}

export default Map
