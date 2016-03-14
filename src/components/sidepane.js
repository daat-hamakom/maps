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

  constructor (props) {
    super(props)
    this.state = { selected_media: 0 }
  }

  render () {
    const evs = this.props.app.selected
    const ev = evs[0]
    return <div id='eventpane' className={evs.length > 0 ? 'open' : 'closed'}>
      <span className="media-dots">{ev.media.filter((m) => m.type == 'image').map((m, i) => {
          return <span className={this.state.selected_media == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={() => {
            this.setState({ selected_media: i })
          }}>{this.state.selected_media == i ? '●' : '○' }</span>
        })
      }</span>
      <span className='close' onClick={this.props.closeSidepane}>✖</span>
      {ev.media.filter((m) => m.type == 'image').length ?
        <img src={ev.media[this.state.selected_media].file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
        : <img src={ev.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
      }

      <div className='content'>
        <h3 className='project'>{ev.project}</h3>
        <h2 className='title'>{ev.title}</h2>
        <div className='place'>{ev.place.name}</div>
        <div className='date'>{this._cleanDates(ev.start_date, ev.end_date)}</div>
        <hr/>
        {ev.media.filter((m) => m.type == 'sound').map((m) => <audio controls>
            <source src={m.file} type="audio/mpeg"/>
          </audio>
        )}
        {ev.media.filter((m) => m.type == 'link' && m.url.contains('youtube')).map((m) => {
            const yturl = m.url.replace('watch', 'embed').replace('/v', '/embed')
            return <iframe allowFullScreen="allowfullscreen" frameBorder="0" src={yturl} width="250"></iframe>
          }
        )}
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

  handleClick = (e) => {
    console.log()
  }

  render () {
    const evs = this.props.app.selected
    return <div id='eventspane' className={evs.length > 0 ? 'open' : 'closed'} >
      <span className='close' onClick={this.props.closeSidepane}>X</span>
      {evs.map((e) => <div key={'list-event-' + e.id} className='event' onClick={() => {
        this.props.selectEvent([e])
      }}>
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
    const evs = this.props.app.selected
    return <div id='sidepane' className={evs.length > 0 ? 'open' : 'closed'}>
      <SidepaneButton openEventsSidepane={this.props.openEventsSidepane} />
      {evs.length == 1
        ? <EventPane  app={this.props.app} sidepane={this.props.sidepane} closeSidepane={this.props.closeSidepane} />
        : <EventsPane app={this.props.app} sidepane={this.props.sidepane} selectEvent={this.props.selectEvent} closeSidepane={this.props.closeSidepane} />
      }
    </div>
  }

}

export default Sidepane
