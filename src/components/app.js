import React from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Timeline from './timeline'
import { fetchEvents } from '../actions'

import '../styles/app.scss'

class App extends React.Component {

  componentDidMount () {
    const { dispatch, events } = this.props
    dispatch(fetchEvents())
  }

  render () {
    return <div>
      <Map events={this.props.events}/>
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
