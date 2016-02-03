import moment from 'moment'
import React from 'react'

class SidepaneButton extends React.Component {
  render () {
    return <div id='sidepaneButton' onClick={this.props.openEventsSidepane}>
      +
    </div>
  }
}

class EventPane extends React.Component {
  _cleanDate (d) {
    return d
    // return moment(d.replace('-00', '').replace('-00', '')).format()
  }

  render () {
    const ev = this.props.sidepane.events[0]
    return <div id='eventpane' className={this.props.sidepane.open}>
      <span className='close' onClick={this.props.closeSidepane}>X</span>
      <h2 className='title'>{ev.title}</h2>
      <div className='start-date'>{this._cleanDate(ev.start_date)}</div>
      <div className='end-date'>{this._cleanDate(ev.end_date)}</div>
      <hr/>
      <span>{ev.icon}</span>
      <div className='description' dangerouslySetInnerHTML={{__html: ev.description}}></div>
    </div>
  }
}

class EventsPane extends React.Component {
  _cleanDate (d) {
    return d
    // return moment(d.replace('-00', '').replace('-00', '')).format()
  }

  render () {
    const evs = this.props.sidepane.events
    return <div id='eventspane' className={this.props.sidepane.open}>
      <span className='close' onClick={this.props.closeSidepane}>X</span>
      {evs.map((e) => <div key={'list-event-' + e.id} className='event'>
        <h3>{e.title}</h3>
        <div className='start-date'>{this._cleanDate(e.start_date)}</div>
        <div className='end-date'>{this._cleanDate(e.end_date)}</div>
        <hr/>
      </div>)}
    </div>
  }
}

class Sidepane extends React.Component {

  render () {
    const evs = this.props.sidepane.events
    return <div id='sidepane' className={this.props.sidepane.open}>
      <SidepaneButton openEventsSidepane={this.props.openEventsSidepane} />
      {evs.length == 1
        ? <EventPane  sidepane={this.props.sidepane} closeSidepane={this.props.closeSidepane} />
        : <EventsPane sidepane={this.props.sidepane} closeSidepane={this.props.closeSidepane} />
      }
    </div>
  }

}

export default Sidepane