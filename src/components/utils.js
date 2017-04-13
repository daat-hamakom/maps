import React from 'react'

export class AudioComponent extends React.Component {

  componentDidUpdate (prevProps) {
    if (this.props.src != prevProps.src) {
      const node = this.refs.audio
      node.load()
    }
  }

  render () {
    return <audio ref='audio' controls>
      <source src={this.props.src} type={this.props.type}/>
    </audio>
  }

}

export function getEventStyle (ev) {
  if (ev.start_date < '1789-')  // vive la revolution
    return 'preindustrial'
  if (ev.start_date < '1900-')  // vive la revolution
    return 'nineteenth'            // until we have the Industrial map
  if (ev.start_date < '1939-')  // vive la revolution
    return 'modernism'            // until we have the Modernism map
  if (ev.start_date < '1945-')  // vive la revolution
    return 'darktimes'
  if (ev.start_date < '2050-')  // vive la revolution
    return 'postwar'
  else
    return 'default'
}

export function getOptionImage(option) {
  if (option.img) return option.img.replace('/media/', '/media_thumbs/').replace(/\+/g, '%2B') + '_s.jpg' ;

  switch (option.type) {
    case 'project':
      return '/static/img/project-icon.svg';
    case 'person':
      return '/static/img/person-icon.svg';
    case 'organization':
      return '/static/img/organization-icon.svg';
    case 'event':
      return '/static/img/event-icon.svg';
    case 'place':
      return '/static/img/place-icon.svg';
    case 'tag':
      return '/static/img/tag-icon.svg';
    default:
      return null;
  }
};


export function getCopyright (media) {
  if (!media.copyrights) {
    if (!media.source_url) return <span>
        <span title={media.source} className="copyright-source">source</span>
      </span>;

    return <span>
        <a target="_blank" title={media.source} href={media.source_url} className="copyright-source">source</a>
      </span>
  }

  if (!media.source_url) return <span>
        &copy; {media.copyrights} (<span title={media.source} className="copyright-source">source</span>)
      </span>;

  return <span>
      &copy; {media.copyrights} (<a target="_blank" title={media.source} href={media.source_url} className="copyright-source">source</a>)
    </span>
}
