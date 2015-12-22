import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Map from './map'
import Timeline from './timeline'

import { incCounter } from '../actions'

import '../styles/app.scss'

class Button extends Component {
  handleClick (e) {
    this.props.onIncClick()
  }

  render () {
    return <button onClick={e => this.handleClick(e)}>DO IT!</button>
  }
}

class Label extends Component {
  render () {
    return <div id="counter">{this.props.counter}</div>
  }
}

class App extends Component {
  render () {
    const { dispatch, markers, counter } = this.props
    return <div>
      <Map/>
      <Timeline/>
      <Button onIncClick={() => dispatch(incCounter())}/>
      <Label counter={counter}/>
    </div>
  }
}

function select(state) {
  return {
    counter: state.counter,
    markers: state.markers
  }
}

export default connect(select)(App)
