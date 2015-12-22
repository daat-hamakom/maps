import { ADD_MARKER, INC_COUNTER } from '../actions'

const initialState = {
  markers: [],
  counter: 0
}

function mapApp(state = initialState, action) {
  switch (action.type) {
    case ADD_MARKER:
      return Object.assign({}, state, {
        markers: [
          ...state.markers,
          {
            coords: action.coords
          }
        ]
      })
    case INC_COUNTER:
      return Object.assign({}, state, {
        counter: state.counter + 1
      })
    default:
      return state
  }
}

export default mapApp
