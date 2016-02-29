import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline,
  hoverEnterEvent, hoverExitEvent, selectEvent, deselectEvent } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(fetchEvents())
  }

  render () {
    const { dispatch } = this.props
    return <div>

      <Map app={this.props.app} events={this.props.events}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev)) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev)) }}
        deselectEvent={() => { dispatch(deselectEvent()) }} />

      <Timeline events={this.props.events} app={this.props.app} timeline={this.props.timeline}
        onZoom={(b, e) => { dispatch(zoomTimeline(b, e)) }}
        dragStart={(x, w) => { dispatch(startDragTimeline(x, w)) }}
        drag={(x) => { dispatch(onDragTimeline(x)) }}
        dragEnd={() => { dispatch(endDragTimeline()) }}
        openEventSidepane={(ev) => { dispatch(selectEvent(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev)) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }} />

      <Sidepane app={this.props.app} sidepane={this.props.sidepane}
        closeSidepane={() => { dispatch(deselectEvent()) }}
        openEventsSidepane={() => { dispatch(selectEvent(this.props.events.items)) }} />

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
