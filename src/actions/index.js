import 'babel-polyfill'

export const REQUEST_EVENTS = 'REQUEST_EVENTS'
export const REQUEST_EVENTS_FAIL = 'REQUEST_EVENTS_FAIL'
export const REQUEST_EVENTS_SUCCESS = 'REQUEST_EVENTS_SUCCESS'

export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const REQUEST_PROJECTS_FAIL = 'REQUEST_PROJECTS_FAIL'
export const REQUEST_PROJECTS_SUCCESS = 'REQUEST_PROJECTS_SUCCESS'

export const REQUEST_ANNOTATIONS = 'REQUEST_ANNOTATIONS'
export const REQUEST_ANNOTATIONS_FAIL = 'REQUEST_ANNOTATIONS_FAIL'
export const REQUEST_ANNOTATIONS_SUCCESS = 'REQUEST_ANNOTATIONS_SUCCESS'

export const ZOOM_TIMELINE = 'ZOOM_TIMELINE'

export const START_DRAG_TIMELINE = 'START_DRAG_TIMELINE'
export const ON_DRAG_TIMELINE = 'ON_DRAG_TIMELINE'
export const END_DRAG_TIMELINE = 'END_DRAG_TIMELINE'
export const SHIFT_TIMELINE = 'SHIFT_TIMELINE'

export const HOVER_ENTER_EVENT = 'HOVER_ENTER_EVENT'
export const HOVER_EXIT_EVENT = 'HOVER_EXIT_EVENT'
export const SELECT_EVENT = 'SELECT_EVENT'
export const DESELECT_EVENT = 'DESELECT_EVENT'

export const OPEN_LIGHTBOX = 'OPEN_LIGHTBOX'
export const CLOSE_LIGHTBOX = 'CLOSE_LIGHTBOX'

export function requestEvents() {
  return { type: REQUEST_EVENTS }
}

export function requestEventsFail() {
  return { type: REQUEST_EVENTS_FAIL }
}

export function requestEventsSuccess(items) {
  return { type: REQUEST_EVENTS_SUCCESS, items: items }
}

export function fetchEvents(projId) {
  return dispatch => {
    dispatch(requestEvents())
    let url = 'https://daat-hamakom-data.herokuapp.com/api/events/'
    if (projId) {
      url = url + '?project=' + projId
    }
    return fetch(url)
      .then(response =>
        response.json()
      )
      .then(json =>
        dispatch(requestEventsSuccess(json))
      )
      .catch(ex =>
        dispatch(requestEventsFail())
      )
  }
}

export function requestProjects() {
  return { type: REQUEST_PROJECTS }
}

export function requestProjectsFail() {
  return { type: REQUEST_PROJECTS_FAIL }
}

export function requestProjectsSuccess(items) {
  return { type: REQUEST_PROJECTS_SUCCESS, items: items }
}

export function fetchProjects() {
  return dispatch => {
    dispatch(requestProjects())
    return fetch('https://daat-hamakom-data.herokuapp.com/api/projects/')
      .then(response =>
        response.json()
      )
      .then(json =>
        dispatch(requestProjectsSuccess(json))
      )
      .catch(ex =>
        dispatch(requestProjectsFail())
      )
  }
}

export function requestAnnotations() {
  return { type: REQUEST_ANNOTATIONS }
}

export function requestAnnotationsFail() {
  return { type: REQUEST_ANNOTATIONS_FAIL }
}

export function requestAnnotationsSuccess(items) {
  return { type: REQUEST_ANNOTATIONS_SUCCESS, items: items }
}

export function fetchAnnotations() {
  return dispatch => {
    dispatch(requestAnnotations())
    return fetch('https://daat-hamakom-data.herokuapp.com/api/annotations/')
      .then(response =>
        response.json()
      )
      .then(json =>
        dispatch(requestAnnotationsSuccess(json))
      )
      .catch(ex =>
        dispatch(requestAnnotationsFail())
      )
  }
}

export function zoomTimeline(begin, end) {
  return { type: ZOOM_TIMELINE, begin: begin, end: end}
}

export function startDragTimeline(x, width) {
  return { type: START_DRAG_TIMELINE, x: x, width: width }
}

export function onDragTimeline(x) {
  return { type: ON_DRAG_TIMELINE, x: x }
}

export function endDragTimeline() {
  return { type: END_DRAG_TIMELINE }
}

export function shiftTimeline(begin, end) {
  return { type: SHIFT_TIMELINE, begin: begin, end: end }
}

export function openEventSidepane(events) {
  return { type: OPEN_EVENT_SIDEPANE, events: events }
}

export function closeSidepane() {
  return { type: CLOSE_SIDEPANE }
}

export function hoverEnterEvent(ev, origin) {
  return { type: HOVER_ENTER_EVENT, ev: ev, origin: origin }
}

export function hoverExitEvent() {
  return { type: HOVER_EXIT_EVENT }
}

export function selectEvent(ev, origin) {
  return { type: SELECT_EVENT, ev: ev, origin: origin }
}

export function deselectEvent() {
  return { type: DESELECT_EVENT }
}

export function openLightbox(ev, selected) {
  return { type: OPEN_LIGHTBOX, ev: ev, selected: selected }
}

export function closeLightbox() {
  return { type: CLOSE_LIGHTBOX }
}
