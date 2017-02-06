import d3 from 'd3'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
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

class YearAxis extends Component {

  static propTypes = {
    x: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number
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

class MarkerData extends Component {
  static propTypes = {
    x: PropTypes.func,
    data: PropTypes.array
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
          else if (this.props.params.tagName) {
            url = 'tag/' + encodeURIComponent(this.props.params.tagName) + '/' + url
          }
          else if (this.props.params.placeId) {
            url = 'place/' + encodeURIComponent(this.props.params.placeId) + '/' + url
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
  router: PropTypes.object.isRequired,
};


class AnnotationLabel extends Component {

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

class D3Timeline extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.array,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    onZoom: PropTypes.func
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
      <svg
        id="timeline-slider"
        width={this.props.width}
        height={this.props.height}
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

class FilterBar extends Component {
  constructor (props) {
    super(props);
    this.state = { filter: "" };

    this.handleChange = this.handleChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.optionRenderer = this.optionRenderer.bind(this);
    this.boldHighlight = this.boldHighlight.bind(this);
    this.getOptionImage = this.getOptionImage.bind(this);

    this.valueRenderer = this.valueRenderer.bind(this);
  }

  onInputChange (value) {
    this.setState({ filter: value });
  }


  optionRenderer (option, i) {
    const typeCapitalized = option.type.charAt(0).toUpperCase() + option.type.slice(1);

    // option.label, option.type
    return (<span id={'option-' + option.value}>
      <img className="image-select-options" src={this.getOptionImage(option)} />
       <p className="label-select-options">{this.boldHighlight(option, i)}</p>
      <span className="type-select-options" >
        &middot; {typeCapitalized}
      </span>
    </span>)
  }

  boldHighlight (option, i) {
    const filter = this.state.filter;
    const filterRegex = new RegExp(filter.toLocaleLowerCase(), 'gi');

    const label = option.label;

    var labelParts = [];

    let matchResult;
    let lastIndex = 0;
    let index;

    while ((matchResult = filterRegex.exec(label)) != null) {
      index = matchResult.index * 2;

      labelParts.push(<span key={index}>{label.slice(lastIndex, matchResult.index)}</span>);
      labelParts.push(<strong key={index+1}>{matchResult[0]}</strong>);
      lastIndex = matchResult.index + +filter.length;
    }
    labelParts.push(<span key={index+2}>{label.slice(lastIndex, label.length+1)}</span>);

    return labelParts;
  }

  getOptionImage (option) {
    if (option.img) return option.img;

    switch (option.type) {
      case 'project':
        return '/static/img/project.png';
      case 'person':
        return '/static/img/person.png';
      case 'organization':
        return '/static/img/organization.png';
      case 'event':
        return '/static/img/event.png';
      case 'place':
        return '/static/img/place.png';
      case 'tag':
        return '/static/img/tag.png';
      default:
        return null;
    }
  }


  valueRenderer (option, i) {
    const typeCapitalized = option.type.charAt(0).toUpperCase() + option.type.slice(1);

    // option.label, option.type
    return (<span id={'option-' + option.value}>
      {option.label} ({typeCapitalized})
    </span>)
  }

  handleChange (val) {
    this.context.router.push(`/${(val ? [val.type, val.id].join('/') : '')}`);
  }

  render () {
    const { projects, people, organizations, events, places, ...props } = this.props;
    let tagsEventsMap = {};
    let tags = [];

    let val = null;
    if (props.drawerData && props.params.personId) {
      val = 'person-' + props.params.personId
    }
    else if (props.drawerData && props.params.projId) {
      val = 'proj-' + props.params.projId
    }
    else if (props.drawerData && props.params.orgId) {
      val = 'org-' + props.params.orgId
    }
    else if (props.drawerData && props.params.tagName) {
      val = 'tag-' + props.params.tagName
    }
    else if (props.drawerData && props.params.placeId) {
      val = 'place-' + props.params.placeId
    }
    else if (props.drawerData && props.params.eventId) {
      val = 'event-' + props.params.eventId
    }

    events && events.map((e) => {
      e.tags && e.tags.map((t) => {
        if (!(t in tagsEventsMap)) tagsEventsMap[t] = [];
        tagsEventsMap[t].push(e.id)
      })
    });

    for (var key in tagsEventsMap) {
      if (tagsEventsMap.hasOwnProperty(key)) {
        tags.push({ type: 'tag', value: `tag-${key}`, id: encodeURIComponent(key), label: key});
      }
    }

    const typesOrder = {'project': 1, 'person': 2, 'organization': 3, 'tag': 4, 'place': 5, 'event': 6};

    const options = projects.map((p) => ({ type: 'project', value: `proj-${p.id}`, id: p.id, label: p.title, img: p.cover_image && p.cover_image.file }))
      .concat(people.map((p) => ({ type: 'person', value: `person-${p.id}`, id: p.id, label: `${p.first_name} ${p.last_name}`, img: p.profile_image && p.profile_image.url })))
      .concat(organizations.map((o) => ({ type: 'organization', value: `org-${o.id}`, id: o.id, label: o.name, img: o.cover_image })))
      .concat(events.map((e) => ({ type: 'event', value: `event-${e.id}`, id: e.id, label: e.title, img: e.icon })))
      .concat(places.map((p) => ({ type: 'place', value: `place-${p.id}`, id: p.id, label: p.name , img: null})))
      .concat(tags)
      .sort((a, b) => {

        if (typesOrder[a.type] > typesOrder[b.type]) return 1;
        if (typesOrder[a.type] < typesOrder[b.type]) return -1;

        if (a.label > b.label) return 1;
        if (a.label < b.label) return -1;
        return 0
      });

    return <div id='filter'>
      <Select
        name="search-bar"
        placeholder='Filter by project, person or organization'
        disabled={false}
        value={val}
        options={options}
        multi={false}
        onInputChange={this.onInputChange}
        filterOption={(option, filter) => (filter.length > 2 && option.label.toLowerCase().indexOf(filter) !== -1)}
        noResultsText="No results found or less then 3 characters in filter"
        onChange={(v) => {this.handleChange(v)}}
        optionRenderer={this.optionRenderer}
        valueRenderer={this.valueRenderer}
        onOpen={props.closeEventSidepane}
      />
    </div>
  }
}

FilterBar.contextTypes = {
  router: PropTypes.object.isRequired,
};

class ProjectMetadata extends Component {
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
        {p.cover_image && <img src={p.cover_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg'}></img>}
      </div>
    </div>
  }
}

class PersonMetadata extends Component {
  render () {
    const p = this.props.person
    const profile = p.profile_image ? p.profile_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg' : ''
    const bd = _cleanBirthDates(p.birth_date, p.death_date)
    return <div className='project'>
      <div className='titles'>
        <h3>Person</h3>
        <h2>{p.first_name} {p.middle_name} {p.last_name}</h2>
        {p.alt_name.length ? <h4>{p.alt_name.join(', ')}</h4> : null}
        <h5>{bd != '0000' ? bd : null}</h5>
        {p.places.length ? <h5>{p.places.join(', ')}</h5> : null}
      </div>
      <div className='description' dangerouslySetInnerHTML={{__html: p.biography.replace(/a href/g, 'a target="_blank" href')}}></div>
      <div className='image'>
        {profile && <img src={profile}></img>}
      </div>
    </div>
  }
}

class OrganizationMetadata extends Component {
  render () {
    const p = this.props.organization
    const cover = p.cover_image ? p.cover_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg' : ''
    const d = _cleanBirthDates(p.start_date, p.end_date)
    return <div className='project'>
      <div className='titles'>
        <h3>Organization</h3>
        <h2>{p.name}{p.type && ` (${p.type})`}</h2>
        <h5>{d != '0000' ? d : null}</h5>
      {p.places.length ? <h5>{p.places.join(', ')}</h5> : null}
      </div>
      <div className='description' dangerouslySetInnerHTML={{__html: p.description.replace(/a href/g, 'a target="_blank" href')}}></div>
      <div className='image'>
        {cover && <img src={cover}></img>}
      </div>
    </div>
  }
}

class PlaceMetadata extends Component {
  render () {
    const p = this.props.place
    const cover = p.cover_image ? p.cover_image.file.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_m.jpg' : ''
    return <div className='place'>
      <div className='titles'>
        <h3>Place</h3>
        <h2>{p.name}</h2>
        <h5>{p.zoomlevel}</h5>
        <h5>{p.position}</h5>
      </div>
      <div className='image'>
        {cover && <img src={cover}></img>}
      </div>
    </div>
  }
}

class TimelineMetadata extends Component {
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
    else if (this.props.drawerData && this.props.params.placeId && this.props.app.drawer)
      return <div id='metadata'>
        <PlaceMetadata place={this.props.drawerData} />
      </div>
    else
      return <div id='metadata'></div>
  }
}

class Timeline extends Component {

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
    const { timeline, params, ...props } = this.props;
    let { startDate, endDate } = timeline;
    const research = params.projId ? props.drawerData : null

    let height = 46 + 120; // search + timeline
    if (props.app.drawer && props.drawerData && (params.projId || params.personId || params.orgId || params.placeId)) {
      height = height + 200;
    }

    return <div id='timeline' style={{height: height}}>
      <div className='handle-container'>
        <div className='handle' onClick={(e) => { props.toggleDrawer() }}></div>
      </div>
      <FilterBar
        params={params}
        drawerData={props.drawerData}
        projects={props.projects.items}
        people={props.people.items}
        events={props.allEvents}
        places={props.places.items}
        organizations={props.organizations.items}
        closeEventSidepane={props.closeEventSidepane}
        openEventSidepane={props.openEventSidepane}
      />
      <TimelineMetadata
        drawerData={props.drawerData}
        app={props.app}
        params={params}
      />
      <D3Timeline
        width={document.body.offsetWidth}
        height={120}
        data={props.events}
        params={params}
        app={props.app}
        timeline={timeline}
        drawer={props.drawer}
        startDate={startDate}
        endDate={endDate}
        dragging={timeline.drag.active}
        onZoom={props.onZoom}
        dragStart={props.dragStart}
        drag={props.drag}
        dragEnd={props.dragEnd}
        shiftTimeline={props.shiftTimeline}
        openEventSidepane={props.openEventSidepane}
        hoverEnterEvent={props.hoverEnterEvent}
        hoverExitEvent={props.hoverExitEvent}
      />
    </div>
  }
}

export default Timeline
