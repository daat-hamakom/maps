import React from 'react'

class LightboxImage extends React.Component {
  render () {
    return <img src={this.props.src}></img>
  }
}

class LightboxYoutubeVideo extends React.Component {
  render () {
    return <iframe allowFullScreen="allowfullscreen" frameBorder="0" src={this.props.src} width="640" height="390"></iframe>
  }
}

class Lightbox extends React.Component {

  render () {
    let active = <div></div>

    if (this.props.lightbox.ev) {
      const m = this.props.lightbox.ev.media.filter((m) => m.type == 'image')[this.props.lightbox.selected]
      switch (m.type) {
        case 'image':
          active = <LightboxImage src={m.file}/>
          break
        case 'youtube':
          active = <LightboxYoutubeVideo/>
          break
        default:
          break
      }
    }

    return <div id='lightbox' className={this.props.lightbox.ev ? 'active' : 'inactive'}
      onClick={() => { this.props.closeLightbox() }}>
      {active}
    </div>
  }

}

export default Lightbox
