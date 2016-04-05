import React from 'react'

class LightboxImage extends React.Component {
  render () {
    return <img src={this.props.src}></img>
  }
}

class LightboxYoutubeVideo extends React.Component {
  render () {
    const yturl = this.props.src.replace('watch', 'embed').replace('/v', '/embed').replace('?v=', '/')
    return <iframe allowFullScreen="allowfullscreen" frameBorder="0" src={yturl} width="640" height="390"></iframe>
  }
}

class Lightbox extends React.Component {

  goLeft () {
    if (this.props.lightbox.selected - 1 >= 0) {
      this.props.selectMedia(this.props.lightbox.ev, this.props.lightbox.selected - 1)
    }
  }

  goRight () {
    if (this.props.lightbox.selected + 1 < this.props.lightbox.ev.media.length) {
      this.props.selectMedia(this.props.lightbox.ev, this.props.lightbox.selected + 1)
    }
  }

  render () {
    let active = <div></div>

    if (this.props.lightbox.ev) {
      const m = this.props.lightbox.ev.media[this.props.lightbox.selected]
      switch (m.type) {
        case 'image':
          active = <LightboxImage src={m.file}/>
          break
        case 'link':
          active = <LightboxYoutubeVideo src={m.url}/>
          break
        default:
          break
      }
    }

    return <div id='lightbox' className={this.props.lightbox.ev ? 'active' : 'inactive'}
      onClick={() => { this.props.closeLightbox() }}
      onKeyDown={(e) => {
        console.log(e)
        if (e.keyCode == 37) this.goLeft()
        else if (e.keyCode == 39) this.goRight()
      }}>
      <div id='media'>
        {active}
      </div>
      <div id='title'>
        {this.props.lightbox.ev ? this.props.lightbox.ev.media[this.props.lightbox.selected].title : ''}
      </div>
      <div id='lightbox-controls'>
        <span className="prev-media" onClick={(e) => {
          this.goLeft()
          e.preventDefault()
          e.stopPropagation()
        }}>‹</span>
        <span className="media-dots">{this.props.lightbox.ev ? (this.props.lightbox.ev.media.map((m, i) => {
            return <span className={this.props.lightbox.selected == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={(e) => {
              this.props.selectMedia(this.props.lightbox.ev, i)
              e.preventDefault()
              e.stopPropagation()
            }}>{this.props.lightbox.selected == i ? '●' : '○' }</span>
          })) : <span></span>
        }</span>
        <span className="next-media"onClick={(e) => {
          this.goRight()
          e.preventDefault()
          e.stopPropagation()
        }}>›</span>
      </div>
    </div>
  }

}

export default Lightbox
