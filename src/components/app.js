import React from 'react'
import { connect } from 'react-redux'

import Lightbox from './lightbox'
import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { fetchEvents, fetchProjects, fetchAnnotations, fetchPlaces, fetchPeople, fetchOrganizations,
  zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline, shiftTimeline,
  hoverEnterEvent, hoverExitEvent, selectEvent, deselectEvent, closeLightbox, openLightbox, setAppStyle, toggleDrawer } from '../actions'

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
    dispatch(fetchPeople())
    dispatch(fetchOrganizations())
  }

  finishedLoading () {
    return (!this.props.events.fetching && this.props.events.items.length > 0) &&
      (!this.props.projects.fetching && this.props.projects.items.length > 0) &&
      (!this.props.annotations.fetching && this.props.annotations.items.length > 0) &&
      (!this.props.places.fetching && this.props.places.items.length > 0)
  }

  componentDidUpdate (prevProps) {
    const { params, events, location, dispatch, ...props } = this.props;

    if (!this.loaded && params.eventId && this.finishedLoading()) {
      this.loaded = true;
      const ev = events.items.filter(e => e.id == params.eventId);
      dispatch(selectEvent(ev, 'url'));
    }

    if (prevProps.location.pathname !== location.pathname && params.eventId && this.loaded ) {
      const ev = events.items.filter(e => e.id == params.eventId);
      dispatch(selectEvent(ev, 'url'));
    }
  }

  render () {
    const { dispatch } = this.props;

    let events = this.props.events.items;
    let drawerData = null;

    let classes = 'app ' + this.props.app.style

    if (this.props.params.projId) {
      events = this.props.events.items.filter(e => e.project == +this.props.params.projId)
      drawerData = this.props.projects.items.find(p => p.id == +this.props.params.projId)
      classes = classes + ' card project'
    }
    if (this.props.params.personId) {
      events = this.props.events.items.filter(e => e.people.map(p => p.id).indexOf(+this.props.params.personId) != -1)
      drawerData = this.props.people.items.find(p => p.id == +this.props.params.personId)
      classes = classes + ' card person'
    }
    if (this.props.params.orgId) {
      events = this.props.events.items.filter(e => e.organizations.map(p => p.id).indexOf(+this.props.params.orgId) != -1);
      drawerData = this.props.organizations.items.find(o => o.id == +this.props.params.orgId);
      classes = classes + ' card organization'
    }
    if (this.props.params.tagName) {
      events = this.props.events.items.filter(e => e.tags && e.tags.indexOf(this.props.params.tagName) != -1);
      drawerData = this.props.events.items.filter(e => e.tags && e.tags.indexOf(this.props.params.tagName) != -1);
      classes = classes + ' card tag'
    }
    if (this.props.params.placeId) {
      events = this.props.events.items.filter(e => e.place && e.place.id == +this.props.params.placeId );
      drawerData = this.props.places.items.find(p => p.id == +this.props.params.placeId);
      classes = classes + ' card place'
    }

    return <div className={classes}>

      <Map
        app={this.props.app}
        events={events}
        params={this.props.params}
        annotations={this.props.annotations}
        places={this.props.places}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'map')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'map')) }}
        deselectEvent={() => { dispatch(deselectEvent()) }}
        setAppStyle={(s) => { dispatch(setAppStyle(s)) }}
        toggleDrawer={() => { dispatch(toggleDrawer()) }}
      />

      <Timeline
        params={this.props.params}
        app={this.props.app}
        drawerData={drawerData}
        events={events}
        timeline={this.props.timeline}
        allEvents={this.props.events.items}
        projects={this.props.projects}
        people={this.props.people}
        places={this.props.places}
        organizations={this.props.organizations}
        onZoom={(b, e) => { dispatch(zoomTimeline(b, e)) }}
        dragStart={(x, w) => { dispatch(startDragTimeline(x, w)) }}
        drag={(x) => { dispatch(onDragTimeline(x)) }}
        dragEnd={() => { dispatch(endDragTimeline()) }}
        shiftTimeline={(b, e) => { dispatch(shiftTimeline(b, e)) }}
        openEventSidepane={(ev) => { dispatch(selectEvent(ev, 'timeline')) }}
        closeEventSidepane={() => { dispatch(deselectEvent()) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'timeline')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        toggleDrawer={() => { dispatch(toggleDrawer()) }}
      />

      <Sidepane
        app={this.props.app}
        projects={this.props.projects}
        sidepane={this.props.sidepane}
        params={this.props.params}
        closeSidepane={() => { dispatch(deselectEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'sidepane')) }}
        openEventsSidepane={() => { dispatch(selectEvent(events, 'sidepane')) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }}
      />

      <Lightbox
        lightbox={this.props.lightbox}
        closeLightbox={() => { dispatch(closeLightbox()) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }}
      />

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
    people: state.people,
    organizations: state.organizations,
    timeline: state.timeline,
    sidepane: state.sidepane,
    lightbox: state.lightbox
  }
}

export default connect(select)(App)
