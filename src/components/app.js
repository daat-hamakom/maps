import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Timeline from './timeline'

import '../styles/app.scss'

class App extends React.Component {
  render () {
    return <div>
      <Map/>
      <Timeline/>
    </div>
  }
}

function select(state) {
  return {
    events: state.events
  }
}

export default connect(select)(App)
