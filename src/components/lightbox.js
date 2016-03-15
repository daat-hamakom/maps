import React from 'react'

class Lightbox extends React.Component {

  render () {
    return <div className={this.props.lightbox.media ? 'lightbox' : 'lightbox inactive'}></div>
  }

}

export default Lightbox
