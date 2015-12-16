import React from 'react'
import { Link } from 'react-router'


class About extends React.Component {
    render() {
        return <div>
            <h1>About</h1>
            <Link to='/'>Home</Link>
        </div>
    }
}

export default About
