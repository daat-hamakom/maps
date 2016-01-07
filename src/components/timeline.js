import d3 from 'd3'
import React from 'react'
import ReactFauxDOM from 'react-faux-dom'

class D3Timeline extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.array,
  }

  render () {
    const {width, height, data, interpolation} = this.props

    const el = d3.select(ReactFauxDOM.createElement('svg'))
      .attr(this.props)
      .attr('data', null)

    const x = d3.time.scale()
        .domain([new Date(1950, 1, 1), new Date(2000, 1, 1)])
        .nice(d3.time.year)
        .range([0, width]);

    const xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.years, 5)
        .tickSize(height)

    const xAxisG = el.append('g')
        .attr('class', 'x axis')
        .call(xAxis)

    xAxisG.selectAll('.tick text')
        .style('text-anchor', 'start')
        .attr('x', 6)
        .attr('y', 6)

    xAxisG.selectAll("line").data(x.ticks(150), function(d) { return d; })
        .enter()
        .append("line")
        .attr("class", "minor")
        .attr("y1", 22)
        .attr("y2", height)
        .attr("x1", x)
        .attr("x2", x)

    el.selectAll('rect').data(data).enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('x', function (d,i) { return x(new Date(d[0], 1, 1)) })
        .attr('width', function (d,i) { return x(new Date(d[1], 1, 1)) - x(new Date(d[0], 1, 1)) })
        .attr('y', function (d,i) { return 40+(i*10) })
        .attr('height', function (d,i) { return 5 })

    return el.node().toReact()
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
      <D3Timeline
        className='example'
        width={document.body.offsetWidth}
        height={200}
        data={data} />
    </div>
  }
}

export default Timeline
