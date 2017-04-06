import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import Lightbox from './lightbox'
import Map from './map'
import Sidepane from './sidepane'
import Timeline from './timeline'
import { ToolbarButtons, AboutModal, HelpModal } from './toolbar'
import { fetchEvents, fetchProjects, fetchAnnotations, fetchPlaces, fetchPeople, fetchOrganizations,
  zoomTimeline, startDragTimeline, onDragTimeline, endDragTimeline, shiftTimeline,
  hoverEnterEvent, hoverExitEvent, selectEvent, deselectEvent, closeLightbox, openLightbox, setAppStyle, toggleDrawer,
  openAboutModal, closeAboutModal, openHelpModal, closeHelpModal
} from '../actions'

import '../styles/app.scss'


class App extends React.Component {

  constructor (props) {
    super(props)
    this.loaded = false
  }

  componentDidMount () {
    const props = this.props;

    props.fetchEvents();
    props.fetchProjects();
    props.fetchAnnotations();
    props.fetchPlaces();
    props.fetchPeople();
    props.fetchOrganizations();
  }

  finishedLoading () {
    const props = this.props;
    const { events, projects, annotations, places } = props;

    return (!events.fetching && events.items.length > 0) &&
      (!projects.fetching && projects.items.length > 0) &&
      (!annotations.fetching && annotations.items.length > 0) &&
      (!places.fetching && places.items.length > 0)
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
    const { dispatch,  ...props } = this.props;

    let events = props.events.items;
    let drawerData = null;

    let classes = 'app ' + props.app.style

    if (props.params.projId) {
      events = props.events.items.filter(e => e.project == +props.params.projId)
      drawerData = props.projects.items.find(p => p.id == +props.params.projId)
      classes = classes + ' card project'
    }
    if (props.params.personId) {
      events = props.events.items.filter(e => e.people.map(p => p.id).indexOf(+props.params.personId) != -1)
      drawerData = props.people.items.find(p => p.id == +props.params.personId)
      classes = classes + ' card person'
    }
    if (props.params.orgId) {
      events = props.events.items.filter(e => e.organizations.map(p => p.id).indexOf(+props.params.orgId) != -1);
      drawerData = props.organizations.items.find(o => o.id == +props.params.orgId);
      classes = classes + ' card organization'
    }
    if (props.params.tagName) {
      events = props.events.items.filter(e => e.tags && e.tags.indexOf(props.params.tagName) != -1);
      drawerData = props.events.items.filter(e => e.tags && e.tags.indexOf(props.params.tagName) != -1);
      classes = classes + ' card tag'
    }
    if (props.params.placeId) {
      events = props.events.items.filter(e => e.place && e.place.id == +props.params.placeId );
      drawerData = props.places.items.find(p => p.id == +props.params.placeId);
      classes = classes + ' card place'
    }

    return <div className={classes}>

      <Map
        app={props.app}
        events={events}
        params={props.params}
        annotations={props.annotations}
        places={props.places}
        openEventSidepane={(ev) => { dispatch(openEventSidepane(ev)) }}
        hoverEnterEvent={(ev) => { dispatch(hoverEnterEvent(ev, 'map')) }}
        hoverExitEvent={() => { dispatch(hoverExitEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'map')) }}
        deselectEvent={() => { dispatch(deselectEvent()) }}
        setAppStyle={(s) => { dispatch(setAppStyle(s)) }}
        toggleDrawer={() => { dispatch(toggleDrawer()) }}
      />

      <Timeline
        params={props.params}
        app={props.app}
        drawerData={drawerData}
        events={events}
        timeline={props.timeline}
        allEvents={props.events.items}
        projects={props.projects}
        people={props.people}
        places={props.places}
        organizations={props.organizations}
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
        app={props.app}
        projects={props.projects}
        places={props.places}
        organizations={props.organizations}
        people={props.people}
        sidepane={props.sidepane}
        params={props.params}
        closeSidepane={() => { dispatch(deselectEvent()) }}
        selectEvent={(ev) => { dispatch(selectEvent(ev, 'sidepane')) }}
        openEventsSidepane={() => { dispatch(selectEvent(events, 'sidepane')) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }}
      />

      <Lightbox
        lightbox={props.lightbox}
        closeLightbox={() => { dispatch(closeLightbox()) }}
        selectMedia={(t, m) => { dispatch(openLightbox(t, m)) }}
      />

      <ToolbarButtons openAboutModal={props.openAboutModal} openHelpModal={props.openHelpModal} />
      <AboutModal onHide={props.closeAboutModal} show={props.toolbar.showAbout} />
      <HelpModal onHide={props.closeHelpModal} show={props.toolbar.showHelp} />
    </div>
  }
}

// todo change to selectors
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
    lightbox: state.lightbox,
    toolbar: state.toolbar,
  }
}

function mapDispatchToProps(dispatch) {
  const actionCreators =  bindActionCreators({
    fetchEvents,
    fetchProjects,
    fetchAnnotations,
    fetchPlaces,
    fetchPeople,
    fetchOrganizations,
    openAboutModal,
    closeAboutModal,
    openHelpModal,
    closeHelpModal
  }, dispatch);

  return {
      ...actionCreators,
    dispatch,
  }
}

export default connect(select, mapDispatchToProps)(App)
