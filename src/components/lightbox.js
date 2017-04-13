import React from 'react'
import { getCopyright } from './utils'

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
  constructor (props) {
    super(props);
    this.getCopyright = getCopyright.bind(this);
  }

  goLeft () {
    --this.props.lightbox.selected;
    const media = this.props.lightbox.ev.media.filter((m) => m.type != 'sound' );
    if (this.props.lightbox.selected < 0) {
      this.props.lightbox.selected = media.length - 1;
    }
    this.props.selectMedia(this.props.lightbox.ev, this.props.lightbox.selected)
  }

  goRight () {
    ++this.props.lightbox.selected;
    const media = this.props.lightbox.ev.media.filter((m) => m.type != 'sound' );

    if (this.props.lightbox.selected > media.length - 1) {
      this.props.lightbox.selected = 0;
    }
    this.props.selectMedia(this.props.lightbox.ev, this.props.lightbox.selected)
  }

  render () {
    let active = <div></div>;
    let media = null;

    if (this.props.lightbox.ev) {
      media = this.props.lightbox.ev.media.filter((m) => m.type != 'sound' );
      const m = media[this.props.lightbox.selected];
      switch (m.type) {
        case 'image':
          active = <LightboxImage src={m.file}/>;
          break;
        case 'link':
          active = <LightboxYoutubeVideo src={m.url}/>;
          break;
        default:
          break
      }
    }
    const selectedMedia = this.props.lightbox.ev && media && media[this.props.lightbox.selected];

    return <div id='lightbox' className={this.props.lightbox.ev ? 'active' : 'inactive'}
      onClick={() => { this.props.closeLightbox() }}
      onKeyDown={(e) => {
        console.log(e)
        if (e.keyCode == 37) this.goLeft()
        else if (e.keyCode == 39) this.goRight()
      }}>

      <div id='media-container'>
        {media && media.length > 1 ? <span className="prev-media" onClick={(e) => {
          this.goLeft()
          e.preventDefault()
          e.stopPropagation()
        }}>‹</span> : null}
        <div id='media'>
          {active}
          <span className="media-mask">
            <span className="media-description">
                {selectedMedia ? selectedMedia.title : ''}
            </span>
          </span>
          <span className="media-copyrights">
              {selectedMedia ? this.getCopyright(selectedMedia) : ''}
          </span>
        </div>
        {media && media.length > 1 ? <span className="next-media" onClick={(e) => {
          this.goRight()
          e.preventDefault()
          e.stopPropagation()
        }}>›</span> : null}
      </div>

      <div id='lightbox-controls'>
        <div className='center'>
          <div className="media-dots">{this.props.lightbox.ev ? (media.map((m, i) => {
              return <span className={this.props.lightbox.selected == i ? 'media-dot selected' : 'media-dot'} key={i} onClick={(e) => {
                this.props.selectMedia(this.props.lightbox.ev, i);
                e.preventDefault();
                e.stopPropagation();
              }}>{this.props.lightbox.selected == i ? '●' : '○' }</span>
            })) : <span></span>
          }</div>
        </div>
      </div>
    </div>
  }

}

export default Lightbox
