import React from 'react'

class Sidepane extends React.Component {

  render () {
    return <div id='sidepane' className={this.props.sidepane.open}>{this.props.sidepane.ev.title}</div>
  }

}

export default Sidepane
