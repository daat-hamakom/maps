import React from 'react'

class SidepaneButton extends React.Component {
  render () {
    return <div id='sidepaneButton'>
      +
    </div>
  }
}

class EventPane extends React.Component {
  render () {
    const ev = this.props.sidepane.ev
    return <div id='eventpane' className={this.props.sidepane.open}>
      <span className='close' onClick={this.props.closeSidepane}>X</span>
      <h2 className='title'>{ev.title}</h2>
      <span className='date'>{ev.start_date}</span>
      <hr/>
      <span>{ev.icon}</span>
      <div className='description' dangerouslySetInnerHTML={{__html: ev.description}}></div>
    </div>
  }
}

class Sidepane extends React.Component {

  render () {
    const ev = this.props.sidepane.ev
    return <div id='sidepane' className={this.props.sidepane.open}>
      <SidepaneButton />
      <EventPane sidepane={this.props.sidepane} closeSidepane={this.props.closeSidepane} />
    </div>
  }

}

export default Sidepane
