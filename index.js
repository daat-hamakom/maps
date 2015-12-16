import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route } from 'react-router'

import About from './src/components/about'
import App from './src/components/app'

import './style.scss'

ReactDOM.render((
  <Router>
    <Route path="/" component={App}/>
    <Route path="about" component={About}/>
  </Router>
), document.getElementById('root'))
