import React, { Component } from 'react'
import { Modal, Tab, Nav, NavItem } from 'react-bootstrap';
import cookie from 'react-cookie';
import onClickOutside from 'react-onclickoutside' 

export class ToolbarButtons extends Component {
  constructor (props) {
    super(props);
    this.state = {hideFlicker: false};
  }

  componentDidMount () {
    setTimeout( () => this.setState({hideFlicker: true}), 30000)
  }

  render () {
    const hideFlicker = cookie.load('hideFlicker');

    return <div id='toolbar-buttons'>
      <span onClick={this.props.openAboutModal}>About</span>
      <span style={{ margin: "0 15px", opacity: 0.25 }}>|</span>
      <div className="help-button">
        <span onClick={this.props.openHelpModal} >Help</span>
        <WrappedHelpFlicker onClick={this.props.openHelpModal} className={this.state.hideFlicker || hideFlicker ? 'fade-out' : ''} />
      </div>
    </div>
  }
}

export class AboutModal extends Component {
  render () {
    return (<Modal show={this.props.show} onHide={this.props.onHide} className="daat-modal about-modal">
      <Modal.Header>
        <button
          className="pull-right modal-close-button"
          onClick={this.props.onHide}
        >
          <img className="image-select-options" src='/static/img/close-group.svg' />
        </button>
      </Modal.Header>
      <Modal.Body>
        <h4 className="modal-title">About</h4>
        <Tab.Container id="left-tabs-example" defaultActiveKey="about-map">
          <div>
            <Nav>
              <NavItem eventKey="about-map" className="modal-tab-nav">
                About Jewish Cultures on the Map
              </NavItem>
              <NavItem eventKey="about-daat" className="modal-tab-nav">
                About Daat-Hamakom
              </NavItem>
              <NavItem eventKey="about-data" className="modal-tab-nav">
                About the Data
              </NavItem>
              <NavItem eventKey="about-copyrights" className="modal-tab-nav">
                Copyrights Disclaimer
              </NavItem>
              <NavItem eventKey="about-credits" className="modal-tab-nav">
                Credits
              </NavItem>
            </Nav>
            <Tab.Content animation>
              <Tab.Pane eventKey="about-map">
                <h4 className="modal-subtitle">About Jewish Cultures on the Map</h4>
                <p>
                  Jewish Cultures on the Map (JCM) is an interactive web-based map developed by Daat-Hamakom. It is based on innovative digital-mapping and information visualization technologies designed to explore and experience Jewish cultures in their historical development from a perspective of time and space. It is designed as a flexible platform for incorporating, presenting and sharing data from existing databases and archives.
                </p>
                <p>
                  The map visualizes dynamic relations and trajectories characteristic of the Jewish world through a uniquely designed interface combining a map with a timeline. It presents multimedia documentary information,including sound,images, and film, along with quantitative geographic information (GIS).
                </p>
                <p>
                  The map is intended to serve as a context for worldwide scholars and experts of all cultural fields to generate and share time-space based information. JCM provides Easy accessibility of high quality content to a wide range of publics, such as university researchers, schoolteachers, students and laypersons searching for information in a platform that differs from extant searching and data mining engines.
                </p>
              </Tab.Pane>
              <Tab.Pane eventKey="about-daat">
                <h4 className="modal-subtitle">About Daat-Hamakom</h4>
                <p>The I-CORE's approach to Modern Jewish Culture is the spatial dimension in all of its connotations. We view the geography of culture as a means of “mapping” where and how certain modes of creativity and their traditions became rooted, or – in many cases – when and how they became uprooted and then were transported to new contexts and transformed. The turn to spatial and geographic concerns in the study of the Humanities can be fruitfully and imaginatively applied to the Jewish case and that, in turn, can enrich Humanistic discourse from our particular angle of vision. The idea of “place” anchors our project in a feasible, structured research agenda, relating to the overall question: how do realia of particular places influence behavior, consciousness, beliefs, and creativity?</p>
              </Tab.Pane>
              <Tab.Pane eventKey="about-data">
                <h4 className="modal-subtitle">About the Data</h4>
                <p>The contents of the map was produced and uploaded by the researchers of Da’at Hamakom and collaborating archives and scholars. The data is arranged as units of information and media called “events” which are accessible through the map and the timeline. Each event is created within an enclosing project, and the creators of the data of each project are listed in the project cards. The source and copyrights owner of the media items within the events is specified within the item display. Additional meta data contain information about historical figures and organizations.</p>
                <p>Contributing archives: The National Library of Isreal, The Hoffamn Collection of Postcards.</p>
              </Tab.Pane>
              <Tab.Pane eventKey="about-copyrights">
                <h4 className="modal-subtitle">Copyrights Disclaimer</h4>
                <p>This database was prepared by the Center for the Study of Cultures in the Jewish World in the Modern Age (hereinafter: “Daat-Hamakom”). The foundation of the program is the Israeli Centers for Research Excellence (I-CORE), an initiative designed by the Planning and Budgeting Committee (PBC) and the Government of Israel.</p>
                <p>The database is designed to map Jewish culture in modern times and is intended for study, research, review and criticism.</p>
                <p>The information in the database is presented as is. “Daat-Hamakom” shall not be held liable for any damage that may be caused to anyone relying on this information, even if there is a mistake in the information, catalog or any other detail in the database.</p>
                <p>The contents of the database for which the original copyright holders are not specified, or otherwise stated, belong to the “Daat-Hamakom”. Any other use permitted by law, including for purposes of fair use as defined in the Law, may be performed in this content. The license to use such content is conditional upon the designation of the “Daat-Hamakom” center or the name of the author appearing next to the displayed content while respecting the moral rights of the content creators.</p>
                <p>The right to use the contents of the database in respect of which the original copyright holders or authors are specified is according to the terms of use of the original owners of the content. “Daat-Hamakom” shall not bear any liability whatsoever as may be made by any person who violates the terms of use of the original rights holders.</p>
                <p>“Daat-Hamakom” did its best to locate the rights holders in the works in the database and to obtain their consent to the use made in this database, to the extent required. However, there may be cases where, for various reasons, the right holder has not been located despite the tracing efforts made. If you are the owner of a work that was used in the database and you did not give your consent, please contact us at <a href="mailto:josefspr@hotmail.com" target="_top">josefspr@hotmail.com</a> and we will take care of the matter.</p>
                <p>If you are harmed in any way by information in the database, or if you understand that any material in the database is used, which is not protected under the fair use protection as defined in the law, please contact <a href="mailto:josefspr@hotmail.com" target="_top">josefspr@hotmail.com</a> and we will clarify your request.</p>
              </Tab.Pane>
              <Tab.Pane eventKey="about-credits">
                <h4 className="modal-subtitle">Credits</h4>
                <p>Director of Da’at Hamakom: <a href="http://www.daat-hamakom.com/team/prof-richard-i-cohen/" target="_blank">Prof. Richard Cohen</a></p>
                <p>
                  Steering Committee:
                  <a href="http://www.daat-hamakom.com/team/amnon-raz-krakotzkin-nono/" target="_blank">Prof. Amnon Raz-Krakotzkin</a>;
                  <a href="http://www.daat-hamakom.com/team/prof-elchanan-reiner/" target="_blank">Prof. Elchanan Reiner</a>,
                  <a href="http://www.daat-hamakom.com/team/prof-menahem-blondheim/" target="_blank">Prof. Menahem Blondheim</a>,
                  <a href="http://www.daat-hamakom.com/team/prof-edwin-seroussi/" target="_blank">Prof. Edwin Seroussi</a>,
                  <a href="http://www.daat-hamakom.com/team/prof-haviva-pedaya/" target="_blank">Prof. Haviva Pedaya</a>
                </p>
                <p>Scientific Director: <a href="http://www.daat-hamakom.com/team/prof-edwin-seroussi/" target="_blank">Prof. Edwin Seroussi</a></p>
                <p>Project Manager: <a href="http://www.daat-hamakom.com/team/dr-josef-sprinzak/" target="_blank">Dr. Josef Sprinzak</a></p>
                <p>Interactive and Graphic Designer: <a href="http://www.shual.com/" target="_blank">Mushon Zer-Aviv</a></p>
                <p>Programmers: <a href="http://appandup.co.il" target="_blank">Tal Ben-Basat</a>, Yuval Adam.</p>
                <p>Administrative Director: <a href="http://www.daat-hamakom.com/contact/" target="_blank">Anat Reches</a></p>
                <p>
                  Advisory Team:
                  <a href="http://www.daat-hamakom.com/team/dr-amos-noy/" target="_blank">Dr. Amos Noy</a>,
                  <a href="http://www.daat-hamakom.com/team/dr-dani-schrire/" target="_blank">Dr. Dani Schrire</a>,
                  <a href="http://www.daat-hamakom.com/team/1141-2/" target="_blank">Dr. Zef Segal</a>,
                  <a href="http://www.daat-hamakom.com/team/eliezer-baumgarten/" target="_blank">Dr. Eliezer Baumgarten</a>
                </p>
                <p>
                  The project was funded by
                  <a href="http://www.i-core.org.il/" target="_blank">The Israeli Centers for Research Excellence (I-CORE)</a>.
                </p>
                <img src="/static/img/icore-logo.png" alt="icore-logo" />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </Modal.Body>
    </Modal>)
  }
}

export class HelpModal extends Component {
  componentDidUpdate () {
    if (this.props.show) {
      let element = document.getElementsByClassName("help-modal");
      element[0].scrollTop += 1000;
    }
  }

  render () {
    return <Modal show={this.props.show} onHide={this.props.onHide}  className="daat-modal help-modal">
      <Modal.Header>
        <button
          className="pull-right modal-close-button"
          onClick={this.props.onHide}
        >
          <img className="image-select-options" src='/static/img/close-group.svg' />
        </button>
      </Modal.Header>
      <Modal.Body>
        <h4 className="modal-title">Help</h4>
        <Tab.Container id="left-tabs-example" defaultActiveKey="help-timeline">
          <div>
            <Nav>
              <NavItem eventKey="help-timeline" className="modal-tab-nav">
                The map and the timeline
              </NavItem>
              <NavItem eventKey="help-event" className="modal-tab-nav">
                Looking into an event
              </NavItem>
            </Nav>
            <Tab.Content animation>
              <Tab.Pane eventKey="help-timeline">
                <h4 className="modal-subtitle">The map and the timeline</h4>
                Use the pad or the mouse wheel to scroll and zoom in the map or the timeline. Hovering on an event on the map or the timeline opens the event thumbnail on the map and the event title appears above the hovered event on the timeline. The colour of the marker is according to the time epoch of the event.
                <iframe width="540" height="310" src="https://www.youtube.com/embed/ydkxP7QMLPA?autoplay=1" className="modal-video" allowFullScreen>
                </iframe>
              </Tab.Pane>
              <Tab.Pane eventKey="help-event">
                <h4 className="modal-subtitle">Looking into an event</h4>
                Click on an event marker on the map or the timeline. The info card of the event will open on the right side of the map. If the location contains more than one event, select one event from the list of all the event of the location. In the event cards you can browse the images and video clips on the top of the card or open an enlarged view by clicking on the image. Events containing sound will have a sound player. At the bottom of the event cards are related people and organizations. Hotspots on project name, people and organizations will open a filtered view of the map.
                <iframe width="540" height="310" src="https://www.youtube.com/embed/ydkxP7QMLPA" className="modal-video" allowFullScreen>
                </iframe>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  }
}


class HelpFlicker extends Component {
  constructor (props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.state = {hideFlicker: false};
  }

  onClick(e) {
    this.props.onClick(e);
    cookie.save('hideFlicker', true)
  }

  handleClickOutside() {
    this.setState({ hideFlicker: true });
  }

  render () {
    return <div className={`help-flicker ${this.props.className} ${this.state.hideFlicker ? 'fade-out' : ''}`}>
      Watch a short intro:
      <img className="flicker-close pull-right" src='/static/img/close-flicker.svg' onClick={this.handleClickOutside} />
      <div onClick={this.onClick}>
        <iframe width="275" height="192" src="https://www.youtube.com/embed/ydkxP7QMLPA"
                className="flicker-video">
        </iframe>
      </div>
    </div>
  }
}
const WrappedHelpFlicker = onClickOutside(HelpFlicker)
