import 'babel-polyfill'

export const REQUEST_EVENTS = 'REQUEST_EVENTS'
export const REQUEST_EVENTS_FAIL = 'REQUEST_EVENTS_FAIL'
export const REQUEST_EVENTS_SUCCESS = 'REQUEST_EVENTS_SUCCESS'

export const ZOOM_TIMELINE = 'ZOOM_TIMELINE'

export const START_DRAG_TIMELINE = 'START_DRAG_TIMELINE'
export const ON_DRAG_TIMELINE = 'ON_DRAG_TIMELINE'
export const END_DRAG_TIMELINE = 'END_DRAG_TIMELINE'

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

export function zoomTimeline(factor) {
  return { type: ZOOM_TIMELINE, factor: factor }
}

export function startDragTimeline(date, x, width) {
  return { type: START_DRAG_TIMELINE, date: date, x: x, width: width }
}

export function onDragTimeline(date, x) {
  return { type: ON_DRAG_TIMELINE, date: date, x: x }
}

export function endDragTimeline() {
  return { type: END_DRAG_TIMELINE }
}
