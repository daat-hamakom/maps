import moment from 'moment'
import React from 'react'

import { AudioComponent, getEventStyle } from './utils'

function _cleanDates (ds, de) {
    let sd = moment(ds.replace('-00', '').replace('-00', ''), 'YYYY-MM-DD')
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
      ed = moment(de.replace('-00', '').replace('-00', ''), 'YYYY-MM-DD')
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

class SidepaneButton extends React.Component {
  render () {
    return <div id='sidepaneButton' onClick={this.props.openEventsSidepane}>
      list view
    </div>
  }
}

class EventPane extends React.Component {

  constructor (props) {
    super(props)
    this.state = { evid: 0, selected_media: 0 }
  }

  componentWillReceiveProps (props) {
    const evs = this.props.app.selected
    if (evs && evs.length > 0) {
      if (evs[0].id != this.state.evid) {
        this.setState({ evid: evs[0].id, selected_media: 0})
      }
    }
  }

  render () {
    const evs = this.props.app.selected
    const ev = evs[0]
    const medias = ev.media.filter((m) => m.type == 'image' || (m.type == 'link' && m.url.indexOf('youtube') !== -1))
    const m = medias[this.state.selected_media]
    let thumburl = ''
    if (m && m.type != 'image') {
      const yturl = m.url.replace('watch', 'embed').replace('/v', '/embed').replace('?v=', '/')
      const ytid = /(embed\/|v=)([A-Za-z0-9_-]{11})/.exec(yturl)[2]
      thumburl = 'http://img.youtube.com/vi/' + ytid + '/0.jpg'
    }

    return <div id='eventpane' className={evs.length > 0 ? 'open' : 'closed'}>
      <span className="media-dots">{medias.map((m, i) => {
          return <span className={this.state.selected_media == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={() => {
            this.setState(Object.assign({}, this.state, { selected_media: i }))
          }}>{this.state.selected_media == i ? '●' : '○' }</span>
        })
      }</span>

      <span className='close' onClick={this.props.closeSidepane}>✖</span>

      {medias.length ?
        m.type == 'image' ?
          <img className='head magnify' src={m.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}
            onClick={() => { this.props.selectMedia(ev, ev.media.findIndex((e) => { return e.file == m.file })) }}></img>
          : <div className='youtube-cover' onClick={() => { this.props.selectMedia(ev, ev.media.findIndex((e) => { return e.url == m.url })) }}>
              <img src={thumburl} className='youtube-thumb'></img>
              <img className='youtube-play' src='/static/img/play.png'></img>
            </div>
        : <img className='head' src={ev.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
      }

      <div className='content'>
        <h3 className='project'>{this.props.projects.items.find((p) => p.id == ev.project).title}</h3>
        <h2 className='title'>{ev.title}</h2>
        <div className='place'>{ev.place.name}</div>
        <div className='date'>{_cleanDates(ev.start_date, ev.end_date)}</div>
        <hr/>
        {ev.media.filter((m) => m.type == 'sound').map((m) => <div className="audio-container">
            <AudioComponent src={m.file} type='audio/mpeg' key={'audio-' + m.id} />
            <p>{m.title}</p>
          </div>
        )}

        <div className='description' dangerouslySetInnerHTML={{__html: ev.description.replace(/a href/g, 'a target="_blank" href')}}></div>
        {ev.media.filter((m) => m.type == 'document').map((m) => {
            return <div className='doc'>
              <a href={m.file} target='_blank'>{m.title}</a>
            </div>
          }
        )}
      </div>
    </div>
  }
}

class EventsPane extends React.Component {

  handleClick = (e) => {
    console.log()
  }

  render () {
    const evs = this.props.app.selected.sort((a,b) => {
      if (a.start_date < b.start_date)
        return 1
      if (a.start_date > b.start_date)
        return -1
      return 0
    })
    return <div id='eventspane' className={evs.length > 0 ? 'open' : 'closed'}>
      <span className='close' onClick={this.props.closeSidepane}>✖</span>
      {evs.map((e) => <div key={'list-event-' + e.id} className={'event ' + getEventStyle(e)} onClick={() => {
        this.props.selectEvent([e])
      }}>
        <span className="event-icon">
          <img src={e.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
        </span>
        <span className="event-data">
          <div className='project'>{this.props.projects.items.find((p) => p.id == e.project).title}</div>
          <div className='title'>{e.title}</div>
          <div className='date'>{_cleanDates(e.start_date, e.end_date)}</div>
        </span>
        <div className='clear'></div>
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
        ? <EventPane  app={this.props.app} projects={this.props.projects} sidepane={this.props.sidepane} proj={this.props.proj} closeSidepane={this.props.closeSidepane} selectMedia={this.props.selectMedia} />
        : <EventsPane app={this.props.app} projects={this.props.projects} sidepane={this.props.sidepane} proj={this.props.proj} selectEvent={this.props.selectEvent} closeSidepane={this.props.closeSidepane} />
      }
    </div>
  }

}

export default Sidepane
