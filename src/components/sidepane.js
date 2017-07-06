import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

import { getOptionImage, getCopyright } from './utils'
import { AudioComponent, getEventStyle } from './utils'
import Dotdotdot from 'react-dotdotdot'

function _cleanDates (ds, de, circa_date=false) {
    let sd = moment(ds.replace('-00', '').replace('-00', ''), 'YYYY-MM-DD')
    if (ds.includes('-00-')) {
      sd = sd.format('YYYY')
    }
    else if (ds.includes('-00')) {
      sd = sd.format('MMM YYYY')
    }
    else {
      sd = sd.format('MMM D, YYYY')
    }

    let ed = ''
    if (de != '') {
      ed = moment(de.replace('-00', '').replace('-00', ''), 'YYYY-MM-DD')
      if (de.includes('-00-')) {
        ed = ed.format('YYYY')
      }
      else if (de.includes('-00')) {
        ed = ed.format('MMM YYYY')
      }
      else {
        ed = ed.format('MMM D, YYYY')
      }
      return circa_date ? sd + ' ~ ' + ed : sd + ' - ' + ed
    }
    return sd
  }

class SidepaneButton extends Component {
  render () {
    return <div id='sidepaneButton' onClick={this.props.openEventsSidepane}>
      list view
    </div>
  }
}

class EventPane extends Component {

  constructor (props) {
    super(props)
    this.state = { evid: 0, selected_media: 0 };
    this.getOptionImage = getOptionImage.bind(this);
    this.getCopyright = getCopyright.bind(this);
  }

  componentWillReceiveProps (props) {
    const evs = this.props.app.selected
    if (evs && evs.length > 0) {
      if (evs[0].id != this.state.evid) {
        this.setState({ evid: evs[0].id, selected_media: 0})
      //  content
        let content = document.querySelector('#eventpane .content');
        content.scrollTop = 0;
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

    // todo - get people
    const people_ids = ev.people.map((ep) => ep.id);
    let people = this.props.people.items.filter(p => people_ids.indexOf(p.id) > -1);

    const organizations_ids = ev.organizations.map((eo) => eo.id);
    let organizations = this.props.organizations.items.filter(o => organizations_ids.indexOf(o.id) > -1);

    return <div id='eventpane' className={evs.length > 0 ? 'open' : 'closed'}>

      <div className="eventpane-header">
        <span className='close' onClick={() => {this.closePane()}} />

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
        <div className="media-dots">{medias.map((m, i) => {
          return <span className={this.state.selected_media == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={() => {
              this.setState(Object.assign({}, this.state, { selected_media: i }))
            }}>{this.state.selected_media == i ? '●' : '○' }</span>
        })
        }</div>
      </div>

      <div className='content'>
      <Link to={`/project/${this.props.projects.items.find((p) => p.id == ev.project).id}`} className='project'>{this.props.projects.items.find((p) => p.id == ev.project).title}</Link>
        <h2 className='title'>{ev.title}</h2>
        <div className='place'>{ev.place.name}</div>
        <div className='date'>{_cleanDates(ev.start_date_orig, ev.end_date_orig, ev.circa_date)}</div>
        <div className='tags'>
          {ev.tags && ev.tags.map((t, index) => <Link key={index} to={`/tag/${t}`} className="tag">#{t} </Link>)}
        </div>
        {ev.description && <hr/>}
        {ev.media.filter((m) => m.type == 'sound').map((m, i) => <div className="audio-container" key={i}>
            <div className="audio-box">
              <p>{m.title}</p>
              <AudioComponent src={m.file} type='audio/mpeg' key={'audio-' + m.id} />
            </div>
            <div className="audio-copyright">
              {this.getCopyright(m)}
            </div>
          </div>
        )}

        <div className='description' dangerouslySetInnerHTML={{__html: ev.description.replace(/a href/g, 'a target="_blank" href')}}></div>
        {ev.media.filter((m) => m.type == 'document').map((m, i) => {
            return <div className='doc' key={i}>
              <a href={m.file} target='_blank'>{m.title}</a>
            </div>
          }
        )}
        {(ev.people.length || ev.organizations.length) ? <hr/> : null}
        <div className='links'>
          {people.length || organizations.length ? <p>Associated with this event: </p> : null }
          {people.map((p) => <Link key={p.id} to={`/person/${p.id}`} className='person-link'>
            <div className="link-image-wrapper" >
              <img className="link-image" src={this.getOptionImage({ img: p.profile_image && (p.profile_image.url || p.profile_image.file), type:'person' })} />
            </div>
            {p.first_name + ' ' + p.last_name}
          </Link>)}
          {organizations.map((o) => <Link  key={o.id} to={`/organization/${o.id}`} className='org-link'>
            <div className="link-image-wrapper" >
              <img className="link-image" src={this.getOptionImage({ img: o.cover_image && o.cover_image.file, type:'organization' })} />
            </div>
            {o.name}
          </Link>)}
        </div>
      </div>

    </div>
  }
}

EventPane.contextTypes = {
  router: PropTypes.object.isRequired,
};

class EventsPane extends Component {

  handleClick = (e) => {
    console.log()
  }

  render () {
    const { app, params, projects, places, people, organizations, ...props } = this.props;
    const evs = app.selected.sort((a,b) => {
      if (a.start_date < b.start_date)
        return 1
      if (a.start_date > b.start_date)
        return -1
      return 0
    })

    let sidpaneTitle = null;
    if (evs.length) {
      const event = evs[0];
      const place = places.items.filter(p => p.id == parseInt(event.place.id, 10))[0];
      sidpaneTitle = place.name;
    }

    return <div id='eventspane' className={evs.length > 0 ? 'open' : 'closed'}>
      <div className="eventspane-header">
        <span className="title" title={sidpaneTitle}>{sidpaneTitle}</span>
        <span className="events-quantity">{`${sidpaneTitle ? ' ● ' : ''}found ${evs.length} events`}</span>
        <span className='close' onClick={props.closeSidepane}>✖</span>
      </div>
      <div div id='events-container'>
        {evs.map((e) => <div key={'list-event-' + e.id} className={'event ' + getEventStyle(e)} onClick={() => {
          props.selectEvent([e])
          let url = '/event/' + e.id
          if (params.projId) {
            url = '/project/' + params.projId + url
          }
          else if (params.personId) {
            url = '/person/' + params.personId + url
          }
          else if (params.orgId) {
            url = '/organization/' + params.orgId + url
          }
          else if (params.tagName) {
            url = '/tag/' + params.tagName + url
          }
          this.context.router.push(url)
        }}>
          <span className="event-icon">
            <div className="event-img" style={{ backgroundImage: `url("${e.icon.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}")` }}></div>
          </span>
          <div className="event-data">
            <div className='project'>{projects.items.find((p) => p.id == e.project).title}</div>
            {e.title && <Dotdotdot clamp={2} >
              <p className='title' title={e.title}>{e.title}</p>
            </Dotdotdot>}
            <div className='date'>{_cleanDates(e.start_date_orig, e.end_date_orig, e.circa_date)}</div>
          </div>
          <div className='clear'></div>
        </div>)}
      </div>
    </div>
  }
}

EventsPane.contextTypes = {
  router: PropTypes.object.isRequired,
};


class Sidepane extends Component {

  render () {
    const { app, projects, places, organizations, people, sidepane, params, ...props } = this.props;
    const evs = app.selected;

    return <div id='sidepane' className={evs.length > 0 ? 'open' : 'closed'}>
      <SidepaneButton openEventsSidepane={props.openEventsSidepane} />
      {evs.length == 1 ? <EventPane
        app={app}
        projects={projects}
        places={places}
        organizations={organizations}
        people={people}
        sidepane={sidepane}
        params={params}
        closeSidepane={props.closeSidepane}
        selectMedia={props.selectMedia}
      /> : <EventsPane
        app={app}
        projects={projects}
        places={places}
        organizations={organizations}
        people={people}
        sidepane={sidepane}
        params={params}
        closeSidepane={props.closeSidepane}
        selectEvent={props.selectEvent}
      />
      }
    </div>
  }

}

export default Sidepane
