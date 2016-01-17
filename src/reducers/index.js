import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS } from '../actions'

const initialState = {
  events: {
    fetching: false,
    items: []
  }
}

function events(state = initialState, action) {
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

const rootReducer = combineReducers({
  events
})

export default rootReducer
