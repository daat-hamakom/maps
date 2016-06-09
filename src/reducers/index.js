import { combineReducers } from 'redux'
import { REQUEST_EVENTS, REQUEST_EVENTS_FAIL, REQUEST_EVENTS_SUCCESS,
  REQUEST_PROJECTS, REQUEST_PROJECTS_FAIL, REQUEST_PROJECTS_SUCCESS,
  REQUEST_ANNOTATIONS, REQUEST_ANNOTATIONS_FAIL, REQUEST_ANNOTATIONS_SUCCESS,
  ZOOM_TIMELINE, START_DRAG_TIMELINE, ON_DRAG_TIMELINE, END_DRAG_TIMELINE, SHIFT_TIMELINE,
  HOVER_ENTER_EVENT, HOVER_EXIT_EVENT, SELECT_EVENT, DESELECT_EVENT, SET_APP_STYLE,
  OPEN_LIGHTBOX, CLOSE_LIGHTBOX } from '../actions'

function app(state = { hover: [], selected: [], origin: null, style: 'default' }, action) {
  switch (action.type) {
    case HOVER_ENTER_EVENT:
      return Object.assign({}, state, { hover: action.ev, origin: action.origin })
    case HOVER_EXIT_EVENT:
      return Object.assign({}, state, { hover: [], origin: null })
    case SELECT_EVENT:
      return Object.assign({}, state, { selected: action.ev, origin: action.origin })
    case DESELECT_EVENT:
      return Object.assign({}, state, { selected: [], origin: null })
    case SET_APP_STYLE:
      return Object.assign({}, state, { style: action.style })
    default:
      return state
  }
}

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

function projects(state = { fetching: false, items: [] }, action) {
  switch (action.type) {
    case REQUEST_PROJECTS:
      return Object.assign({}, state, { fetching: true })
    case REQUEST_PROJECTS_FAIL:
      return Object.assign({}, state, { fetching: false })
    case REQUEST_PROJECTS_SUCCESS:
      return Object.assign({}, state, { fetching: false, items: action.items })
    default:
      return state
  }
}

function annotations(state = { fetching: false, items: [] }, action) {
  switch (action.type) {
    case REQUEST_ANNOTATIONS:
      return Object.assign({}, state, { fetching: true })
    case REQUEST_ANNOTATIONS_FAIL:
      return Object.assign({}, state, { fetching: false })
    case REQUEST_ANNOTATIONS_SUCCESS:
      return Object.assign({}, state, { fetching: false, items: action.items })
    default:
      return state
  }
}

const timelineState = {
  startDate: new Date(1500, 1, 1),
  endDate: new Date(2050, 1, 1),
  drag: { active: false, sd: 0, ed: 0, x: 0, xc: 0 }
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
      }})
    case END_DRAG_TIMELINE:
      return Object.assign({}, state, { drag: { active: false, x: 0, xc: 0, width: 0 }})
    case SHIFT_TIMELINE:
      const b = action.begin.toDate()
      const e = action.end.toDate()
      return Object.assign({}, state, { startDate: b, endDate: e })
    default:
      return state
  }
}

function sidepane(state = { }, action) {
  switch (action.type) {
    default:
      return state
  }
}

function lightbox(state = { ev: null, selected: null }, action) {
  switch (action.type) {
    case OPEN_LIGHTBOX:
      return Object.assign({}, state, { ev: action.ev, selected: action.selected })
    case CLOSE_LIGHTBOX:
      return Object.assign({}, state, { ev: null, selected: null })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  app,
  events,
  projects,
  annotations,
  timeline,
  sidepane,
  lightbox
})

export default rootReducer
