import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline,
  openEventSidepane, closeSidepane } from '../actions'

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
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }} />

      <Timeline events={this.props.events} timeline={this.props.timeline}
        onZoom={factor => { dispatch(zoomTimeline(factor)) }}
        dragStart={(x, w) => { dispatch(startDragTimeline(x, w)) }}
        drag={(x) => { dispatch(onDragTimeline(x)) }}
        dragEnd={() => { dispatch(endDragTimeline()) }} />

      <Sidepane sidepane={this.props.sidepane}
        closeSidepane={() => { dispatch(closeSidepane()) }}/>

    </div>
  }
}

function select(state) {
  return {
    events: state.events,
    timeline: state.timeline,
    sidepane: state.sidepane
  }
}

export default connect(select)(App)
