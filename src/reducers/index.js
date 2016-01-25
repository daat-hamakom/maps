import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS, ZOOM_TIMELINE } from '../actions'

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

function timeline(state = { startDate: start_date, endDate: end_date }, action) {
  switch (action.type) {
    case ZOOM_TIMELINE:
      const new_start = new Date(state.startDate.getTime() + (20000000000 * action.factor))
      const new_end = new Date(state.endDate.getTime() - (20000000000 * action.factor))
      return Object.assign({}, state, { startDate: new_start, endDate: new_end })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  events,
  timeline
})

export default rootReducer
