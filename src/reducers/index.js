import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS,
  ZOOM_TIMELINE, START_DRAG_TIMELINE, ON_DRAG_TIMELINE, END_DRAG_TIMELINE,
  OPEN_EVENT_SIDEPANE, CLOSE_SIDEPANE } from '../actions'

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
  }
}

function timeline(state = timelineState, action) {
  switch (action.type) {
    case ZOOM_TIMELINE:
      const zoom_factor = 1.01
      var new_start = 0
      var new_end = 0
      const st = Math.abs(state.startDate.getTime())
      const et = state.endDate.getTime()
      console.log(st, et)

      if (action.factor == -1) {
        new_start = new Date(Math.sign(st) * Math.pow(st, zoom_factor))
        var delta = new_start.getTime() - st;
        new_end = new Date(et - delta)
      }
      else {
        new_start = new Date(Math.sign(st) * Math.pow(st, 1/zoom_factor))
        var delta = st - new_start.getTime();
        new_end = new Date(et + delta)
      }

      if (new_end > new_start) {
        return Object.assign({}, state, { startDate: new_start, endDate: new_end })
      }

      else {
        return state
      }
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
