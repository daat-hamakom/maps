import React from 'react'
import { connect } from 'react-redux'

import Lightbox from './lightbox'
import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, fetchProjects, fetchAnnotations, fetchPlaces, zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline, shiftTimeline,
  hoverEnterEvent, hoverExitEvent, selectEvent, deselectEvent, closeLightbox, openLightbox, setAppStyle, toggleProj } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  constructor (props) {
    super(props)
    this.loaded = false
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(fetchEvents())
    dispatch(fetchProjects())
    dispatch(fetchAnnotations())
    dispatch(fetchPlaces())
  }

  finishedLoading () {
    return (!this.props.events.fetching && this.props.events.items.length > 0) &&
      (!this.props.projects.fetching && this.props.projects.items.length > 0) &&
      (!this.props.annotations.fetching && this.props.annotations.items.length > 0) &&
      (!this.props.places.fetching && this.props.places.items.length > 0)
  }

  componentDidUpdate (prevProps) {
    if (!this.loaded && this.props.params.eventId && this.finishedLoading()) {
      this.loaded = true
      const ev = this.props.events.items.filter(e => e.id == this.props.params.eventId)
      this.props.dispatch(selectEvent(ev, 'url'))
    }
  }

  render () {
    const { dispatch } = this.props

    let events = this.props.events.items
    if (this.props.params.projId) {
      events = this.props.events.items.filter(e => e.project == this.props.params.projId)
    }

    return <div className={'app ' + this.props.app.style}>

      <Map app={this.props.app} events={events} proj={this.props.params.projId}
        annotations={this.props.annotations} places={this.props.places}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'map')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'map')) }}
        deselectEvent={() => { dispatch(deselectEvent()) }}
        setAppStyle={(s) => { dispatch(setAppStyle(s)) }}
        toggleProj={() => { dispatch(toggleProj()) }} />

      <Timeline proj={this.props.params.projId} projects={this.props.projects} app={this.props.app}
        events={events} timeline={this.props.timeline}
        onZoom={(b, e) => { dispatch(zoomTimeline(b, e)) }}
        dragStart={(x, w) => { dispatch(startDragTimeline(x, w)) }}
        drag={(x) => { dispatch(onDragTimeline(x)) }}
        dragEnd={() => { dispatch(endDragTimeline()) }}
        shiftTimeline={(b, e) => { dispatch(shiftTimeline(b, e)) }}
        openEventSidepane={(ev) => { dispatch(selectEvent(ev, 'timeline')) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'timeline')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        toggleProj={() => { dispatch(toggleProj()) }} />

      <Sidepane app={this.props.app} projects={this.props.projects} sidepane={this.props.sidepane}
        proj={this.props.params.projId}
        closeSidepane={() => { dispatch(deselectEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'sidepane')) }}
        openEventsSidepane={() => { dispatch(selectEvent(events, 'sidepane')) }}
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
