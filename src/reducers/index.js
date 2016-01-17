import { ADD_EVENTS } from '../actions'

const initialState = {
  events: []
}

function mapApp(state = initialState, action) {
  switch (action.type) {
    case ADD_EVENTS:
      return Object.assign({}, state, { events: action.events })
    default:
      return state
  }
}

export default mapApp
