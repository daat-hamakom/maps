import React from 'react'

export class AudioComponent extends React.Component {

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

export function getEventStyle (ev) {
  if (ev.start_date < '1789-')  // vive la revolution
    return 'preindustrial'
  if (ev.start_date < '1900-')  // vive la revolution
    return 'nineteenth'            // until we have the Industrial map
  if (ev.start_date < '1939-')  // vive la revolution
    return 'modernism'            // until we have the Modernism map
  if (ev.start_date < '1945-')  // vive la revolution
    return 'darktimes'
  if (ev.start_date < '2050-')  // vive la revolution
    return 'postwar'
  else
    return 'default'
}
