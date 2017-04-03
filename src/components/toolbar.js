import React, { Component } from 'react'
import { Modal, Tab, Nav, NavItem } from 'react-bootstrap';

export class ToolbarButtons extends Component {
  render () {
    return <div id='toolbarButtons'>
      <span onClick={this.props.openAboutModal}>About</span>
      <span style={{ margin: "0 15px" }}>|</span>
      <span onClick={this.props.openHelpModal}>Help</span>
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
                About The Map
              </NavItem>
              <NavItem eventKey="about-daat" className="modal-tab-nav">
                About Daat Hamakom
              </NavItem>
            </Nav>
            <Tab.Content animation>
              <Tab.Pane eventKey="about-map">
                <h4 className="modal-subtitle">About The Map</h4>
                About The Map Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
              </Tab.Pane>
              <Tab.Pane eventKey="about-daat">
                <h4 className="modal-subtitle">About Daat Hamakom</h4>
                About Daat Hamakom is simply text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </Modal.Body>
    </Modal>)
  }
}

export class HelpModal extends Component {
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
                <iframe width="540" height="310" src="https://www.youtube.com/embed/ydkxP7QMLPA" className="modal-video">
                </iframe>
              </Tab.Pane>
              <Tab.Pane eventKey="help-event">
                <h4 className="modal-subtitle">Looking into an event</h4>
                Click on an event marker on the map or the timeline. The info card of the event will open on the right side of the map. If the location contains more than one event, select one event from the list of all the event of the location. In the event cards you can browse the images and video clips on the top of the card or open an enlarged view by clicking on the image. Events containing sound will have a sound player. At the bottom of the event cards are related people and organizations. Hotspots on project name, people and organizations will open a filtered view of the map.
                <iframe width="540" height="310" src="https://www.youtube.com/embed/ydkxP7QMLPA" className="modal-video">
                </iframe>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  }
}