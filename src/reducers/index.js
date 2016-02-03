import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS,
  ZOOM_TIMELINE, START_DRAG_TIMELINE, ON_DRAG_TIMELINE, END_DRAG_TIMELINE,
  OPEN_EVENT_SIDEPANE, CLOSE_SIDEPANE,
  HOVER_ENTER_EVENT, HOVER_EXIT_EVENT } from '../actions'

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

const timelineState = {
  startDate: new Date(1500, 1, 1),
  endDate: new Date(2050, 1, 1),
  drag: {
    active: false,
    sd: 0,
    ed: 0,
    x: 0,
    xc: 0
  },
  hover: null
}

function timeline(state = timelineState, action) {
  switch (action.type) {
    case ZOOM_TIMELINE:
      return Object.assign({}, state, { startDate: action.begin, endDate: action.end })
    case START_DRAG_TIMELINE:
      return Object.assign({}, state, { drag: {
        active: true,
        sd: state.startDate.getTime(),
        ed: state.endDate.getTime(),
        x: action.x,
        xc: action.x,
        width: action.width
      }})
    case ON_DRAG_TIMELINE:
      const delta = (state.drag.ed - state.drag.sd) * (
        (state.drag.x - action.x) / state.drag.width)
      var ns = new Date(state.drag.sd + delta)
      var ne = new Date(state.drag.ed + delta)
      return Object.assign({}, state, { startDate: ns, endDate: ne, drag: {
        active: true,
        sd: state.drag.sd,
        ed: state.drag.ed,
        x: state.drag.x,
        xc: action.x,
        width: state.drag.width
      } })
    case END_DRAG_TIMELINE:
      return Object.assign({}, state, { drag: { active: false, x: 0, xc: 0, width: 0 }})
    case HOVER_ENTER_EVENT:
      return Object.assign({}, state, { hover: action.ev })
    case HOVER_EXIT_EVENT:
      return Object.assign({}, state, { hover: null })
    default:
      return state
  }
}

function sidepane(state = { open: 'closed', events: [] }, action) {
  switch (action.type) {
    case OPEN_EVENT_SIDEPANE:
      return Object.assign({}, state, { open: 'open', events: action.events })
    case CLOSE_SIDEPANE:
      return Object.assign({}, state, { open: 'closed', events: [] })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  events,
  timeline,
  sidepane
})

export default rootReducer
