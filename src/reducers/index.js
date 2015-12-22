import { ADD_MARKER } from '../actions'

const initialState = {
  markers: []
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
    default:
      return state
  }
}

export default mapApp
