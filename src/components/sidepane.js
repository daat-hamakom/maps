import React from 'react'

class Sidepane extends React.Component {

  render () {
    const ev = this.props.sidepane.ev
    return <div id='sidepane' className={this.props.sidepane.open}>
      <span className='close'>X</span>
      <h2 className='title'>{ev.title}</h2>
      <span className='date'>{ev.start_date}</span>
      <hr/>
      <span>{ev.icon}</span>
      <div className='description' dangerouslySetInnerHTML={{__html: ev.description}}></div>
    </div>
  }

}

export default Sidepane
