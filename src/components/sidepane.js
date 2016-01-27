import React from 'react'

class Sidepane extends React.Component {

  render () {
    return <div id='sidepane' className={this.props.sidepane.open}>Hello</div>
  }

}

export default Sidepane
