import d3 from 'd3'
import React from 'react'
import ReactFauxDOM from 'react-faux-dom'

class YearAxis extends React.Component {

  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number
  }

  componentWillMount () {
    const {width, height} = this.props

    this.x = d3.time.scale()
        .domain([new Date(1950, 1, 1), new Date(2000, 1, 1)])
        .nice(d3.time.year)
        .range([0, width]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(d3.time.years, 5)
        .tickSize(height)
  }

  componentDidMount () {
    this.renderAxis()
  }

  componentDidUpdate () {
    this.renderAxis()
  }

  renderAxis () {

    // el.selectAll('rect').data(data).enter()
    //     .append('rect')
    //     .attr('class', 'rect')
    //     .attr('x', function (d,i) { return x(new Date(d[0], 1, 1)) })
    //     .attr('width', function (d,i) { return x(new Date(d[1], 1, 1)) - x(new Date(d[0], 1, 1)) })
    //     .attr('y', function (d,i) { return 40+(i*10) })
    //     .attr('height', function (d,i) { return 5 })

    const yearAxisG = d3.select(this.refs.yearAxis).call(this.xAxis)

    yearAxisG.selectAll('.tick text')
        .style('text-anchor', 'start')
        .attr('x', 6)
        .attr('y', 6)

    yearAxisG.selectAll('line').data(this.x.ticks(150), function(d) { return d; })
        .enter()
        .append('line')
        .attr('class', 'minor')
        .attr('y1', 22)
        .attr('y2', this.props.height)
        .attr('x1', this.x)
        .attr('x2', this.x)
  }

  render () {
    return <g ref='yearAxis' className='x axis' />
  }
}

class D3Timeline extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.array,
  }

  render () {
    return <svg width={this.props.width} height={this.props.height}>
      <YearAxis width={this.props.width} height={this.props.height} />
    </svg>
  }
}

class Timeline extends React.Component {
  render () {
    const data = [
      [1961, 1969],
      [1964, 1967],
      [1971, 1999],
      [1955, 1972],
      [1984, 1996]
    ]

    return <div id='timeline'>
      <D3Timeline width={document.body.offsetWidth} height={200} data={data} />
    </div>
  }
}

export default Timeline
