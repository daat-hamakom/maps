import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline,
  openEventSidepane, closeSidepane,
  hoverEnterEvent, hoverExitEvent } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(fetchEvents())
  }

  render () {
    const { dispatch } = this.props
    return <div>

      <Map events={this.props.events}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev)) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }} />

    </div>
  }
}

function select(state) {
  return {
    app: state.app,
    events: state.events,
    timeline: state.timeline,
    sidepane: state.sidepane
  }
}

export default connect(select)(App)
