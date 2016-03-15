import React from 'react'

class Lightbox extends React.Component {

  render () {
    return <div id='lightbox' className={this.props.lightbox.media ? 'active' : 'inactive'}
      onClick={() => { this.props.closeLightbox() }}>
    {this.props.lightbox.media ?
      <img src={this.props.lightbox.media}></img> :
      <div></div>
    }
    </div>
  }

}

export default Lightbox
