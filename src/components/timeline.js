import d3 from 'd3'
import moment from 'moment'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactFauxDOM from 'react-faux-dom'

import { zoomTimeline } from '../actions'

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
        const y = 40+(d.id%10)*10
        const width = this.props.x(ed.toDate()) - this.props.x(sd.toDate())
        const height = 3
        const r = height + 1
        const className = (this.props.app.hover[0] && this.props.app.hover[0].id == d.id) || (
          this.props.app.selected[0] && this.props.app.selected[0].id == d.id) ? 'marker active' : 'marker inactive'

        const rectProps = { x: x, width: width, y: y, height: height, rx: 2, ry: 2, className: className }
        const circleProps = { cx: x + width / 2, cy: y + (r / 2), r: r, className: className }
        const lineProps = { x1: x + width / 2, y1: 0, x2: x + width / 2, y2: y, className: className}

        return <g ref={'marker-' + d.id} key={d.id} onClick={(e) => {
          this.props.openEventSidepane([d])
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

    const className = ev ? 'annotation' : 'annotation inactive'
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

  onWheelHandler = (e) => {
    const direction = e.deltaY != Math.abs(e.deltaY) ? 1 : -1
    const pos = e.clientX / this.props.width
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
      <svg width={this.props.width} height={this.props.height}
        onWheel={this.onWheelHandler}
        onMouseDown={this.startDragHandler}
        onMouseUp={this.endDragHandler}
        onMouseMove={this.onDragHandler}>
        <YearAxis x={this.x} width={this.props.width} height={this.props.height} />
        <MarkerData ref='marker-data' x={this.x} data={this.props.data} app={this.props.app} timeline={this.props.timeline} openEventSidepane={this.props.openEventSidepane}
          hoverEnterEvent={this.props.hoverEnterEvent} hoverExitEvent={this.props.hoverExitEvent} />
      </svg>
      <AnnotationLabel data={this.props.data} app={this.props.app} x={this.x} />
    </div>
  }
}

class Timeline extends React.Component {
  render () {
    const { startDate, endDate } = this.props.timeline
    return <div id='timeline'>
      <D3Timeline width={document.body.offsetWidth} height={140} data={this.props.events.items}
        app={this.props.app} timeline={this.props.timeline}
        startDate={startDate} endDate={endDate} dragging={this.props.timeline.drag.active}
        onZoom={this.props.onZoom}
        dragStart={this.props.dragStart}
        drag={this.props.drag}
        dragEnd={this.props.dragEnd}
        shiftTimeline={this.props.shiftTimeline}
        openEventSidepane={this.props.openEventSidepane}
        hoverEnterEvent={this.props.hoverEnterEvent}
        hoverExitEvent={this.props.hoverExitEvent} />
    </div>
  }
}

export default Timeline
