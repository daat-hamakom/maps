import React from 'react'

class AudioComponent extends React.Component {

  componentDidUpdate (prevProps) {
    if (this.props.src != prevProps.src) {
      const node = this.refs.audio
      node.load()
    }
  }

  render () {
    return <audio ref='audio' controls>
      <source src={this.props.src} type={this.props.type}/>
    </audio>
  }

}

export default AudioComponent
