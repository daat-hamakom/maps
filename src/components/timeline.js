import d3 from 'd3'
import d3_axis from 'd3-axis'
import React from 'react'

class D3Timeline extends React.Component {

  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.array,
  }

  componentWillMount () {
    this.x = d3.time.scale()
        .domain([new Date(1950, 1, 1), new Date(2000, 1, 1)])
        .nice(d3.time.year)
        .range([0, this.props.width]);
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(d3.time.years, 5)
        .tickSize(this.props.height)
    // this.xAxisG = el.append('g')
    //     .attr('class', 'x axis')
    //     .call(xAxis)
    // this.xAxisG.selectAll('.tick text')
    //     .style('text-anchor', 'start')
    //     .attr('x', 6)
    //     .attr('y', 6)

  }

  componentDidMount () {
    this.renderAxis()
  }

  componentDidUpdate () {
    this.renderAxis()
  }

  render() {
    const {width, height, data} = this.props
    return <svg width={width} height={height} data={null}>
      <g ref="timeAxis" />
    </svg>
  }

  renderAxis() {
    this.xScale
       .domain([new Date(1950, 1, 1), new Date(2000, 1, 1)])
       .range([0, this.props.width])

    d3.select(this.refs.timeAxis).call(this.xAxis)
   }

  renderrrr () {
    const {width, height, data} = this.props









    // xAxisG.selectAll("line").data(x.ticks(150), function(d) { return d; })
    //     .enter()
    //     .append("line")
    //     .attr("class", "minor")
    //     .attr("y1", 22)
    //     .attr("y2", height)
    //     .attr("x1", x)
    //     .attr("x2", x)

    // el.selectAll('rect').data(data).enter()
    //     .append('rect')
    //     .attr('class', 'rect')
    //     .attr('x', function (d,i) { return x(new Date(d[0], 1, 1)) })
    //     .attr('width', function (d,i) { return x(new Date(d[1], 1, 1)) - x(new Date(d[0], 1, 1)) })
    //     .attr('y', function (d,i) { return 40+(i*10) })
    //     .attr('height', function (d,i) { return 5 })

    return <svg width={width} height={height} data={null}>

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
