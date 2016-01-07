import d3 from 'd3'
import React from 'react'
import ReactFauxDOM from 'react-faux-dom'

class D3Timeline extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.array,
    interpolation: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.function
    ])
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
        .tickSize(height)

    el.append('g')
        .attr('class', 'x axis')
        .call(xAxis)
      .selectAll('.tick text')
        .style('text-anchor', 'start')
        .attr('x', 6)
        .attr('y', 6)

    return el.node().toReact()
  }
}

class Timeline extends React.Component {
  render () {
    const data = [85, 66, 71, 10, 5, 16, 71, 1, 16, 24, 54, 85, 37, 36, 43, 67, 63, 23, 96, 53, 25]

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
