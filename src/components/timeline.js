import d3 from 'd3'
import moment from 'moment'
import React from 'react'
import ReactFauxDOM from 'react-faux-dom'

import { zoomTimeline } from '../actions'

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
        var ds = d.start_date.replace('-00', '-01').replace('-00', '-01').replace('0000', '2000')
        var sd = moment(ds, 'YYYY-MM-DD')
        if (d.end_date != "") {
          var eds = d.end_date.replace('-00', '-01').replace('-00', '-01')
          var ed = moment(ds, 'YYYY-MM-DD')
          const markerProps = {
            x: this.props.x(sd.toDate()),
            width: this.props.x(ed.toDate()) - this.props.x(sd.toDate()),
            y: 40+(d.id%10)*10,
            height: 5,
            key: d.id,
            className: 'marker'
          }
          return <rect {...markerProps}></rect>
        }
        else {
          const markerProps = {
            cx: this.props.x(sd.toDate()),
            r: 2,
            cy: 40+(d.id%10)*10,
            key: d.id,
            className: 'marker'
          }
          return <circle {...markerProps}></circle>
        }
      })}
    </g>
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
    const factor = e.deltaY == Math.abs(e.deltaY) ? -1 : 1
    this.props.onZoom(factor)
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

  componentDidUpdate () {
    this.x = d3.time.scale()
      .domain([this.props.startDate, this.props.endDate])
      .nice(d3.time.year)
      .range([0, this.props.width])
  }

  render () {
    return <svg width={this.props.width} height={this.props.height}
      onWheel={this.onWheelHandler}
      onMouseDown={this.startDragHandler}
      onMouseUp={this.endDragHandler}
      onMouseMove={this.onDragHandler}>
      <YearAxis x={this.x} width={this.props.width} height={this.props.height} />
      <MarkerData x={this.x} data={this.props.data} />
    </svg>
  }
}

class Timeline extends React.Component {
  render () {
    const { startDate, endDate } = this.props.timeline
    return <div id='timeline'>
      <D3Timeline width={document.body.offsetWidth} height={200} data={this.props.events.items}
        startDate={startDate} endDate={endDate} dragging={this.props.timeline.drag.active}
        onZoom={this.props.onZoom}
        dragStart={this.props.dragStart}
        drag={this.props.drag}
        dragEnd={this.props.dragEnd} />
    </div>
  }
}

export default Timeline
