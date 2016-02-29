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
  _cleanDates (ds, de) {

    let sd = moment(ds.replace('-00', '').replace('-00', ''))
    if (ds.includes('-00-')) {
      sd = sd.format('YYYY')
    }
    else if (ds.includes('-00')) {
      sd = sd.format('MMMM YYYY')
    }
    else {
      sd = sd.format('MMMM D, YYYY')
    }

    console.log(ds, de)

    let ed = ''
    if (de != '') {
      ed = moment(de.replace('-00', '').replace('-00', ''))
      if (de.includes('-00-')) {
        ed = ed.format('YYYY')
      }
      else if (de.includes('-00')) {
        ed = ed.format('MMMM YYYY')
      }
      else {
        ed = ed.format('MMMM D, YYYY')
      }
      return sd + ' - ' + ed
    }

    return sd

  }

  render () {
    const ev = this.props.sidepane.events[0]
    return <div id='eventpane' className={this.props.sidepane.open}>
      <span className='close' onClick={this.props.closeSidepane}>X</span>
      <img src={ev.icon}></img>
      <div className='content'>
        <h3 className='project'>{ev.project}</h3>
        <h2 className='title'>{ev.title}</h2>
        <div className='place'>{ev.place.name}</div>
        <div className='date'>{this._cleanDates(ev.start_date, ev.end_date)}</div>
        <hr/>
        <div className='description' dangerouslySetInnerHTML={{__html: ev.description}}></div>
      </div>
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
