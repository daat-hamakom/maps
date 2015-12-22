import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'

import About from './src/components/about'
import App from './src/components/app'
import mapApp from './src/reducers'

let store = createStore(mapApp)

ReactDOM.render((
  <Provider store={store}>
    <Router>
      <Route path='/' component={App}/>
      <Route path='about' component={About}/>
    </Router>
  </Provider>
), document.getElementById('root'))
