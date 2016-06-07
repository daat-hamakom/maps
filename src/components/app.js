import React from 'react'
import { connect } from 'react-redux'

import Lightbox from './lightbox'
import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, fetchProjects, fetchAnnotations, fetchPlaces, zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline, shiftTimeline,
  hoverEnterEvent, hoverExitEvent, selectEvent, deselectEvent, closeLightbox, openLightbox, setAppStyle } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  componentDidMount () {
    const { dispatch } = this.props
    const projId = this.props.params.projId
    dispatch(fetchEvents(projId))
    dispatch(fetchProjects())
    dispatch(fetchAnnotations())
    dispatch(fetchPlaces())
  }

  render () {
    const { dispatch } = this.props
    return <div className={'app ' + this.props.app.style}>

      <Map app={this.props.app} events={this.props.events}
        annotations={this.props.annotations} places={this.props.places}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'map')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'map')) }}
        deselectEvent={() => { dispatch(deselectEvent()) }}
        setAppStyle={(s) => { dispatch(setAppStyle(s)) }} />

      <Timeline proj={this.props.params.projId} projects={this.props.projects} app={this.props.app}
        events={this.props.events} timeline={this.props.timeline}
        onZoom={(b, e) => { dispatch(zoomTimeline(b, e)) }}
        dragStart={(x, w) => { dispatch(startDragTimeline(x, w)) }}
        drag={(x) => { dispatch(onDragTimeline(x)) }}
        dragEnd={() => { dispatch(endDragTimeline()) }}
        shiftTimeline={(b, e) => { dispatch(shiftTimeline(b, e)) }}
        openEventSidepane={(ev) => { dispatch(selectEvent(ev, 'timeline')) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'timeline')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }} />

      <Sidepane app={this.props.app} projects={this.props.projects} sidepane={this.props.sidepane}
        closeSidepane={() => { dispatch(deselectEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'sidepane')) }}
        openEventsSidepane={() => { dispatch(selectEvent(this.props.events.items, 'sidepane')) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }} />

      <Lightbox lightbox={this.props.lightbox} closeLightbox={() => { dispatch(closeLightbox()) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }} />

    </div>
  }
}

function select(state) {
  return {
    app: state.app,
    events: state.events,
    projects: state.projects,
    annotations: state.annotations,
    places: state.places,
    timeline: state.timeline,
    sidepane: state.sidepane,
    lightbox: state.lightbox
  }
}

export default connect(select)(App)
