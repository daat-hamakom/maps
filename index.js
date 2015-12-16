import './style.scss'

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router'
import About from './src/components/about';
import App from './src/components/app';

// ReactDOM.render(<App />, document.getElementById('root'));

ReactDOM.render((
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={About}/>
    </Route>
  </Router>
), document.getElementById('root'))
