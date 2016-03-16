import React from 'react'

class Lightbox extends React.Component {

  render () {
    return <div id='lightbox' className={this.props.lightbox.media ? 'active' : 'inactive'}
      onClick={() => { this.props.closeLightbox() }}>
    {this.props.lightbox.media ?
      (this.props.lightbox.mtype == 'image' ?
        <img src={this.props.lightbox.media}></img> :
        <iframe allowFullScreen="allowfullscreen" frameBorder="0" src={this.props.lightbox.media} width="640" height="390"></iframe>) :
      <div></div>
    }
    </div>
  }

}

export default Lightbox
