import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Timeline from './timeline'
import { fetchEvents, zoomTimeline } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(fetchEvents())
  }

  render () {
    const { dispatch } = this.props
    return <div>
      <Map events={this.props.events} />
      <Timeline timeline={this.props.timeline} onZoom={ev => {
          dispatch(zoomTimeline())
        }
      } />
    </div>
  }
}

function select(state) {
  return {
    events: state.events,
    timeline: state.timeline
  }
}

export default connect(select)(App)
