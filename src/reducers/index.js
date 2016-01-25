import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS,
  ZOOM_TIMELINE, START_DRAG_TIMELINE, ON_DRAG_TIMELINE, END_DRAG_TIMELINE } from '../actions'

function events(state = { fetching: false, items: [] }, action) {
  switch (action.type) {
    case REQUEST_EVENTS:
      return Object.assign({}, state, { fetching: true })
    case REQUEST_EVENTS_FAIL:
      return Object.assign({}, state, { fetching: false })
    case REQUEST_EVENTS_SUCCESS:
      return Object.assign({}, state, { fetching: false, items: action.items })
    default:
      return state
  }
}

const start_date = new Date(1950, 1, 1)
const end_date = new Date(2000, 1, 1)

function timeline(state = { startDate: start_date, endDate: end_date, dragging: false, dragPosition: 0 }, action) {
  switch (action.type) {
    case ZOOM_TIMELINE:
      const zoom_factor = 1.1
      var new_start = 0
      var new_end = 0
      if (action.factor == -1) {
        new_start = new Date(state.startDate.getTime() * zoom_factor)
        var delta = new_start.getTime() - state.startDate.getTime();
        new_end = new Date(state.endDate.getTime() - delta)
      }
      else {
        new_start = new Date(state.startDate.getTime() / zoom_factor)
        var delta = state.startDate.getTime() - new_start.getTime();
        new_end = new Date(state.endDate.getTime() + delta)
      }
      return Object.assign({}, state, { startDate: new_start, endDate: new_end })
    case START_DRAG_TIMELINE:
      return Object.assign({}, state, { dragging: true, dragPosition: action.position })
    case ON_DRAG_TIMELINE:
      return Object.assign({}, state, { dragPosition: action.position })
    case END_DRAG_TIMELINE:
      return Object.assign({}, state, { dragging: false })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  events,
  timeline
})

export default rootReducer
