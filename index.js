import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'
import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import About from './src/components/about'
import App from './src/components/app'
import { fetchEvents } from './src/actions'
import rootReducer from './src/reducers'

const loggerMiddleware = createLogger()

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  //loggerMiddleware
)(createStore)

const store = createStoreWithMiddleware(rootReducer)

ReactDOM.render((
  <Provider store={store}>
    <Router>
      <Route path='/' component={App}>
        <Route path='/event/:eventId' component={App}/>
        <Route path='/project/:projId' component={App}/>
        <Route path='/project/:projId/event/:eventId' component={App}/>
        <Route path='/person/:personId' component={App}/>
        <Route path='/person/:personId/event/:eventId' component={App}/>
        <Route path='/organization/:orgId' component={App}/>
        <Route path='/organization/:orgId/event/:eventId' component={App}/>
      </Route>
      <Route path='about' component={About}/>
    </Router>
  </Provider>
), document.getElementById('root'))
