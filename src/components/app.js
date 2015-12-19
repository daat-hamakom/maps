import React from 'react'
import { Link } from 'react-router'

import Map from './map'
import Timeline from './timeline'

import '../styles/app.scss'


class App extends React.Component {
    render() {
        return <div>
            <Map/>
            <Timeline/>
        </div>
    }
}

export default App
