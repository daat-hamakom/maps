import d3 from 'd3'
import moment from 'moment'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactFauxDOM from 'react-faux-dom'
import Select from 'react-select';

import { getEventStyle } from './utils'
import { zoomTimeline } from '../actions'

import 'react-select/dist/react-select.css';

function _cleanDates (ds, de) {
  // take start date and optional end date, both accept 00 ranges
  // and return a proper start to end normalized date

  var sd = ''
  var ed = ''

  if (de != '') {
    ed = de.replace('-00-', '-12-').replace('-00', '-28').replace('0000', '2000')
  }
  else {
    if (ds.includes('-00-')) {
      ed = ds.replace('-00-', '-12-').replace('-00', '-31')
    }
    else {
      if (ds.includes('-00')) {
        ed = ds.replace('-00', '-28')
      }
      else {
        ed = moment(ds, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD')
      }
    }
  }

  ds = ds.replace('-00-', '-01-').replace('-00', '-01').replace('0000', '2000')

  var sd = moment(ds, 'YYYY-MM-DD')
  var ed = moment(ed, 'YYYY-MM-DD')

  return { sd: sd, ed: ed }
}

function _cleanBirthDates (ds, de) {
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

class YearAxis extends React.Component {

  static propTypes = {
    x: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  constructor (props) {
    super(props)
    this.xAxis = d3.svg.axis()
      .scale(props.x)
      .orient('bottom')
      .ticks(d3.time.years, 5)
      .tickSize(props.height)
  }

  componentDidMount () {
    this.renderAxis()
  }

  componentDidUpdate () {
    this.renderAxis()
  }

  renderAxis () {
    this.xAxis = d3.svg.axis()
      .scale(this.props.x)
      .orient('bottom')
      .tickSize(this.props.height)

    const yearAxisG = d3.select(this.refs.yearAxis).call(this.xAxis)

    yearAxisG.selectAll('.tick text')
        .style('text-anchor', 'start')
        .attr('x', 6)
        .attr('y', 6)

    // yearAxisG.selectAll('line').data(this.props.x.ticks(150), function(d) { return d; })
    //     .enter()
    //     .append('line')
    //     .attr('class', 'minor')
    //     .attr('y1', 22)
    //     .attr('y2', this.props.height)
    //     .attr('x1', this.props.x)
    //     .attr('x2', this.props.x)
  }

  render () {
    return <g ref='yearAxis' className='x axis' />
  }
}

class MarkerData extends React.Component {
  static propTypes = {
    x: React.PropTypes.func,
    data: React.PropTypes.array
  };

  render () {
    return <g ref='markerData' className='markers'>
      {this.props.data.map((d) => {
        const sd = moment(d.start_date)
        const ed = moment(d.end_date)

        const x = this.props.x(sd.toDate())
        const y = 20+(d.id%10)*10
        const width = this.props.x(ed.toDate()) - this.props.x(sd.toDate())
        const height = 2
        const r = height + 1
        const evstyle = getEventStyle(d)
        let className = (this.props.app.hover[0] && this.props.app.hover[0].id == d.id) || (
          this.props.app.selected[0] && this.props.app.selected[0].id == d.id) ? 'marker active' : 'marker inactive'
        className = className + ' ' + evstyle

        const rectProps = { x: x, width: width, y: y, height: height, rx: 2, ry: 2, className: className }
        const circleProps = { cx: x + width / 2, cy: y + (r / 2), r: r, className: className }
        const lineProps = { x1: x + width / 2, y1: 0, x2: x + width / 2, y2: y, className: className}

        return <g className={evstyle} ref={'marker-' + d.id} key={d.id} onClick={(e) => {
          this.props.openEventSidepane([d])
          let url = 'event/' + d.id
          if (this.props.params.projId) {
            url = 'project/' + this.props.params.projId + '/' + url
          }
          else if (this.props.params.personId) {
            url = 'person/' + this.props.params.personId + '/' + url
          }
          else if (this.props.params.orgId) {
            url = 'organization/' + this.props.params.orgId + '/' + url
          }
          this.context.router.push(url)
          this.props.hoverExitEvent()
        }} onMouseEnter={(e) => {
          this.props.hoverEnterEvent([d])
        }} onMouseLeave={(e) => {
          this.props.hoverExitEvent()
        }}>
          <circle {...circleProps}></circle>
          <rect {...rectProps}></rect>
          <line {...lineProps}></line>
        </g>
      })}
    </g>
  }
}

MarkerData.contextTypes = {
  router: React.PropTypes.object.isRequired,
};


class AnnotationLabel extends React.Component {

  render () {
    let ev = this.props.data.find(
      (e) => this.props.app.hover[0] && this.props.app.hover[0].id == e.id
    )

    if (!ev) {
      ev = this.props.data.find(
        (e) => this.props.app.selected[0] && this.props.app.selected[0].id == e.id
      )
    }

    let left = 0;
    if (ev) {
      const {sd, ed} = _cleanDates(ev.start_date, ev.end_date)
      const width = this.props.x(ed.toDate()) - this.props.x(sd.toDate())
      left = this.props.x(sd.toDate()) + width / 2
    }

    const className = ev ? 'annotation' + ' ' + getEventStyle(ev) : 'annotation inactive'

    return <div className={className} style={{left: left + 'px'}}>
      <span className='text'>{ ev ? ev.title: 'Hello' }</span>
    </div>
  }
}

class D3Timeline extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.array,
    startDate: React.PropTypes.object,
    endDate: React.PropTypes.object,
    onZoom: React.PropTypes.func
  };

  constructor (props) {
    super(props)
    this.x = d3.time.scale()
      .domain([this.props.startDate, this.props.endDate])
      .nice(d3.time.year)
      .range([0, this.props.width])
  }

  doZoom (direction, pos) {
    const factor = this.props.width / 10

    const cs = this.props.startDate
    const ce = this.props.endDate

    const sd = direction * factor * pos
    const ed = direction * factor * (1 - pos)

    const ns = this.x.invert(0 + sd)
    const ne = this.x.invert(this.props.width - ed)

    if (ne > ns) {
      this.props.onZoom(ns, ne)
    }
  }

  onWheelHandler = (e) => {
    const direction = e.deltaY != Math.abs(e.deltaY) ? 1 : -1
    const pos = e.clientX / this.props.width

    this.doZoom(direction, pos)

    e.preventDefault()
    e.stopPropagation()
  };

  startDragHandler = (e) => {
    this.props.dragStart(e.clientX, this.props.width)
    e.preventDefault()
    e.stopPropagation()
  };

  onDragHandler = (e) => {
    if (this.props.dragging) {
      this.props.drag(e.clientX)
    }
    e.preventDefault()
    e.stopPropagation()
  };

  endDragHandler = (e) => {
    this.props.dragEnd()
    e.preventDefault()
    e.stopPropagation()
  };

  centerEvent(ev) {
    const dates = _cleanDates(ev.start_date, ev.end_date)
    const center = dates.ed.diff(dates.sd) / 2
    const span = this.props.endDate - this.props.startDate
    let ns = moment(dates.sd)
    let ne = moment(dates.ed)
    ns.subtract(span / 2)
    ne.add(span / 2)
    this.props.shiftTimeline(ns, ne)
  }

  componentWillReceiveProps (props) {
    this.x = d3.time.scale()
      .domain([props.startDate, props.endDate])
      .nice(d3.time.year)
      .range([0, props.width])
  }

  handleSelected(t, origin) {
    if (t == 'select' && origin != 'timeline') {
      let ev = this.props.app.selected[0]
      this.centerEvent(ev)
    }
  }

  handleDeselected(t) {
    return
  }

  checkSelectAndHover (t, origin, prevProp, nextProp) {
    const prev = prevProp.length
    const next = nextProp.length
    if (prev == 0 && next > 0) {
      this.handleSelected(t, origin)
    }
    else if (prev > 0 && next == 0) {
      this.handleDeselected(t)
    }
    else if (prev > 0 && next > 0 && prevProp[0].id != nextProp[0].id) {
      this.handleDeselected(t)
      this.handleSelected(t, origin)
    }
  }

  componentDidUpdate (prevProps) {
    this.checkSelectAndHover('select', this.props.app.origin, prevProps.app.selected, this.props.app.selected)
    this.checkSelectAndHover('hover', this.props.app.origin, prevProps.app.hover, this.props.app.hover)
  }

  render () {
    return <div ref='timeline'>
      <div className='controls'>
        <ul>
          <li onClick={(e) => {
            this.doZoom(1, 0.5)
          }}><img src="/static/img/zoom-in.png"></img></li>
          <li onClick={(e) => {
            this.doZoom(-1, 0.5)
          }}><img src="/static/img/zoom-out.png"></img></li>
        </ul>
      </div>
      <svg width={this.props.width} height={this.props.height}
        onWheel={this.onWheelHandler}
        onMouseDown={this.startDragHandler}
        onMouseUp={this.endDragHandler}
        onMouseMove={this.onDragHandler}>
        <YearAxis x={this.x} width={this.props.width} height={this.props.height} />
        <MarkerData ref='marker-data' x={this.x} data={this.props.data} app={this.props.app} params={this.props.params}
          timeline={this.props.timeline} openEventSidepane={this.props.openEventSidepane}
          hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent} />
      </svg>
      <AnnotationLabel data={this.props.data} app={this.props.app} x={this.x} />
    </div>
  }
}

class FilterBar extends React.Component {

  handleChange (val) {
    if (val)
      this.context.router.push('/' + val.type + '/' + val.id)
    else
      this.context.router.push('/')
  }

  render () {
    let val = null
    if (this.props.drawerData && this.props.params.personId) {
      val = 'person-' + this.props.params.personId
    }
    else if (this.props.drawerData && this.props.params.projId) {
      val = 'proj-' + this.props.params.projId
    }
    else if (this.props.drawerData && this.props.params.orgId) {
      val = 'org-' + this.props.params.orgId
    }

    const options = this.props.projects.map((p) => { return { type: 'project', value: 'proj-' + p.id, id: p.id, label: p.title + ' (Project)'}} ).concat(
      this.props.people.map((p) => { return { type: 'person', value: 'person-' + p.id, id: p.id, label: p.first_name + ' ' + p.last_name + ' (Person)' }} )
    ).concat(
      this.props.organizations.map((o) => { return { type: 'organization', value: 'org-' + o.id, id: o.id, label: o.name + ' (Organization)' }} )
    ).sort((a, b) => {
      if (a.label > b.label) return 1
      if (a.label < b.label) return -1
      return 0
    })

    return <div id='filter'>
      <Select name="search-bar" placeholder='Filter by project, person or organization' disabled={false} value={val}
    options={options} multi={false} onChange={(v) => {this.handleChange(v)}} onOpen={this.props.closeEventSidepane} />
    </div>
  }
}

FilterBar.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

class ProjectMetadata extends React.Component {
  render () {
    const p = this.props.project
    return <div className='project'>
      <div className='titles'>
        <h3>Project</h3>
        <h2>{p.title}</h2>
        <h3>{p.subtitle}</h3>
        <p>{p.researchers.join(', ')}</p>
      </div>
      <div className='description' dangerouslySetInnerHTML={{__html: p.synopsis.replace(/a href/g, 'a target="_blank" href')}}></div>
      <div className='image'>
        <img src={p.cover_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>
      </div>
    </div>
  }
}

class PersonMetadata extends React.Component {
  render () {
    const p = this.props.person
    const profile = p.profile_image ? p.profile_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg' : ''
    const bd = _cleanBirthDates(p.birth_date, p.death_date)
    return <div className='project'>
      <div className='titles'>
        <h3>Person</h3>
        <h2>{p.first_name} {p.middle_name} {p.last_name}</h2>
        <h4>{p.alt_name.join(', ')}</h4>
        <h5>{bd}</h5>
        <h5>{p.places.join(', ')}</h5>
      </div>
      <div className='description' dangerouslySetInnerHTML={{__html: p.biography.replace(/a href/g, 'a target="_blank" href')}}></div>
      <div className='image'>
        {profile && <img src={profile}></img>}
      </div>
    </div>
  }
}

class OrganizationMetadata extends React.Component {
  render () {
    const p = this.props.organization
    const cover = p.cover_image ? p.cover_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg' : ''
    return <div className='project'>
      <div className='titles'>
        <h3>Organization</h3>
        <h2>{p.name}</h2>
      </div>
      <div className='description' dangerouslySetInnerHTML={{__html: p.description.replace(/a href/g, 'a target="_blank" href')}}></div>
      <div className='image'>
        {cover && <img src={cover}></img>}
      </div>
    </div>
  }
}

class TimelineMetadata extends React.Component {
  render () {
    if (this.props.drawerData && this.props.params.projId && this.props.app.drawer)
      return <div id='metadata'>
        <ProjectMetadata project={this.props.drawerData} />
      </div>
    else if (this.props.drawerData && this.props.params.personId && this.props.app.drawer)
      return <div id='metadata'>
        <PersonMetadata person={this.props.drawerData} />
      </div>
    else if (this.props.drawerData && this.props.params.orgId && this.props.app.drawer)
      return <div id='metadata'>
        <OrganizationMetadata organization={this.props.drawerData} />
      </div>
    else
      return <div id='metadata'></div>
  }
}

class Timeline extends React.Component {

  constructor (props) {
    super(props)
    this.resized = false
  }

  componentDidUpdate () {
    if (!this.resized && this.props.events.length) {
      if (this.props.params.projId && this.props.drawerData) {
        let startDate = this.props.events.map(e => e.start_date).reduce((prev, cur, curind, ar) => {
          return cur < prev ? cur : prev
        })
        let endDate = this.props.events.map(e => e.end_date).reduce((prev, cur, curind, ar) => {
          return cur > prev ? cur : prev
        })

        let ns = moment(startDate)
        let ne = moment(endDate)

        const padding = (ne - ns) / 20

        ns.subtract(padding)
        ne.add(padding)

        this.resized = true
        this.props.shiftTimeline(ns, ne)
      }
      else {
        this.resized = true
      }
    }
  }

  render () {
    let { startDate, endDate } = this.props.timeline
    const research = this.props.params.projId ? this.props.drawerData : null

    let height = 46 + 120; // search + timeline
    if (this.props.app.drawer && this.props.drawerData) {
      height = height + 200;
    }

    return <div id='timeline' style={{height: height + 'px'}}>
      <div className='handle-container'><div className='handle' onClick={(e) => { this.props.toggleDrawer() }}></div></div>
      <FilterBar params={this.props.params} drawerData={this.props.drawerData} projects={this.props.projects.items}
        people={this.props.people.items} organizations={this.props.organizations.items}
        closeEventSidepane={this.props.closeEventSidepane}/>
      <TimelineMetadata drawerData={this.props.drawerData} app={this.props.app} params={this.props.params} />
      <D3Timeline width={document.body.offsetWidth} height={120} data={this.props.events} params={this.props.params}
        app={this.props.app} timeline={this.props.timeline} drawer={this.props.drawer}
        startDate={startDate} endDate={endDate} dragging={this.props.timeline.drag.active}
        onZoom={this.props.onZoom} dragStart={this.props.dragStart} drag={this.props.drag} dragEnd={this.props.dragEnd}
        shiftTimeline={this.props.shiftTimeline} openEventSidepane={this.props.openEventSidepane}
        hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent} />
    </div>
  }
}

export default Timeline
