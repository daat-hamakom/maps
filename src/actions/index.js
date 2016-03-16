import 'babel-polyfill'

export const REQUEST_EVENTS = 'REQUEST_EVENTS'
export const REQUEST_EVENTS_FAIL = 'REQUEST_EVENTS_FAIL'
export const REQUEST_EVENTS_SUCCESS = 'REQUEST_EVENTS_SUCCESS'

export const ZOOM_TIMELINE = 'ZOOM_TIMELINE'

export const START_DRAG_TIMELINE = 'START_DRAG_TIMELINE'
export const ON_DRAG_TIMELINE = 'ON_DRAG_TIMELINE'
export const END_DRAG_TIMELINE = 'END_DRAG_TIMELINE'

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

export function fetchEvents() {
  return dispatch => {
    dispatch(requestEvents())
    return fetch('https://daat-hamakom-data.herokuapp.com/api/events/')
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

export function openEventSidepane(events) {
  return { type: OPEN_EVENT_SIDEPANE, events: events }
}

export function closeSidepane() {
  return { type: CLOSE_SIDEPANE }
}

export function hoverEnterEvent(ev) {
  return { type: HOVER_ENTER_EVENT, ev: ev }
}

export function hoverExitEvent() {
  return { type: HOVER_EXIT_EVENT }
}

export function selectEvent(ev) {
  return { type: SELECT_EVENT, ev: ev }
}

export function deselectEvent() {
  return { type: DESELECT_EVENT }
}

export function openLightbox(mtype, media) {
  return { type: OPEN_LIGHTBOX, mtype: mtype, media: media }
}

export function closeLightbox() {
  return { type: CLOSE_LIGHTBOX }
}
