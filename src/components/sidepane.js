import moment from 'moment'
import React from 'react'
import { Link } from 'react-router'

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

  closePane () {
    const { params, ...props } = this.props;
    props.closeSidepane();

    let url = '/';
    if (params.projId) {
      url = `/project/${params.projId}`
    } else if (params.personId) {
      url = `/person/${params.personId}`
    } else if (params.orgId) {
      url = `/organization/${params.orgId}`
    } else if (params.placeId) {
      url = `/place/${params.placeId}`
    } else if (params.tagName) {
      url = `/tag/${params.tagName}`
    }

    this.context.router.push(url);
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
      <div className="media-dots">{medias.map((m, i) => {
          return <span className={this.state.selected_media == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={() => {
            this.setState(Object.assign({}, this.state, { selected_media: i }))
          }}>{this.state.selected_media == i ? '●' : '○' }</span>
        })
      }</div>

      <span className='close' onClick={() => {this.closePane()}}>✖</span>

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
      <Link to={`/project/${this.props.projects.items.find((p) => p.id == ev.project).id}`} className='project' onClick={() =>  {this.props.closeSidepane()}}>{this.props.projects.items.find((p) => p.id == ev.project).title}</Link>
        <h2 className='title'>{ev.title}</h2>
        <div className='place'>{ev.place.name}</div>
        <div className='date'>{_cleanDates(ev.start_date_orig, ev.end_date_orig)}</div>
        <hr/>
        {ev.media.filter((m) => m.type == 'sound').map((m, i) => <div className="audio-container" key={i}>
            <AudioComponent src={m.file} type='audio/mpeg' key={'audio-' + m.id} />
            <p>{m.title}</p>
          </div>
        )}

        <div className='description' dangerouslySetInnerHTML={{__html: ev.description.replace(/a href/g, 'a target="_blank" href')}}></div>
        {ev.media.filter((m) => m.type == 'document').map((m, i) => {
            return <div className='doc' key={i}>
              <a href={m.file} target='_blank'>{m.title}</a>
            </div>
          }
        )}
        <hr/>
        <div className='links'>
          {ev.people.map((p) => <Link to={`/person/${p.id}`} onClick={() => {this.props.closeSidepane()}} className='person-link'>{p.first_name + ' ' + p.last_name}</Link>)}
          {ev.organizations.map((o) => <Link to={`/organization/${o.id}`} onClick={() => {this.props.closeSidepane()}} className='org-link'>{o.name}</Link>)}
        </div>
      </div>

    </div>
  }
}

EventPane.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

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
        let url = 'event/' + e.id
        if (this.props.params.projId) {
          url = 'project/' + this.props.params.projId + '/' + url
        }
        else if (this.props.params.personId) {
          url = 'person/' + this.props.params.personId + '/' + url
        }
        else if (this.props.params.orgId) {
          url = 'organization/' + this.props.params.orgId + '/' + url
        }
        else if (this.props.params.tagName) {
          url = 'tag/' + this.props.params.tagName + '/' + url
        }
        this.context.router.push(url)
      }}>
        <span className="event-icon">
          <img src={e.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
        </span>
        <div className="event-data">
          <div className='project'>{this.props.projects.items.find((p) => p.id == e.project).title}</div>
          <div className='title'>{e.title}</div>
          <div className='date'>{_cleanDates(e.start_date_orig, e.end_date_orig)}</div>
        </div>
        <div className='clear'></div>
      </div>)}
    </div>
  }
}

EventsPane.contextTypes = {
  router: React.PropTypes.object.isRequired,
};


class Sidepane extends React.Component {

  render () {
    const { app, projects, sidepane, params, ...props } = this.props;
    const evs = app.selected;

    return <div id='sidepane' className={evs.length > 0 ? 'open' : 'closed'}>
      <SidepaneButton openEventsSidepane={this.props.openEventsSidepane} />
      {evs.length == 1
        ? <EventPane  app={app} projects={projects} sidepane={sidepane} params={params} closeSidepane={props.closeSidepane} selectMedia={props.selectMedia} />
        : <EventsPane app={app} projects={projects} sidepane={sidepane} params={params} closeSidepane={props.closeSidepane} selectEvent={props.selectEvent} />
      }
    </div>
  }

}

export default Sidepane
