export const REQUEST_EVENTS = 'REQUEST_EVENTS'
export const REQUEST_EVENTS_FAIL = 'REQUEST_EVENTS_FAIL'
export const REQUEST_EVENTS_SUCCESS = 'REQUEST_EVENTS_SUCCESS'

export function requestEvents() {
  return { type: REQUEST_EVENTS }
}

export function requestEventsFail() {
  return { type: REQUEST_EVENTS_FAIL }
}

export function requestEventsSuccess(items) {
  return { type: REQUEST_EVENTS_SUCCESS, items: items }
}
