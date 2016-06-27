import React from 'react'

class AudioComponent extends React.Component {

  render () {
    return <audio controls>
      <source src={this.props.src} type={this.props.type}/>
    </audio>
  }

}

export default AudioComponent
