import React from "react";
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Popover from 'material-ui/Popover/Popover';
import getHelpDoc from '../assets/docs/HelpDocs';
import { withRouter } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';
import Ionicon from 'react-ionicons';
import { trackEvent } from '../lib/Analytics';

class HelpButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showHelp: false,
      anchorEl: null
    };

    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    event.preventDefault();

    trackEvent({
      category: 'Help',
      action: 'Help Clicked',
      label: this.props.location
    });

    this.setState({
      showHelp: !this.state.showHelp,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose() {
    this.setState({
      showHelp: false
    });
  };

  render() {
    return (
      <div
        className={this.state.showHelp ? '' : 'hint--bottom-left hint--rounded'}
        aria-label='Help'
        style={{ cursor: 'pointer' }}
      >
        <FloatingActionButton
          onClick={ this.handleTouchTap }
          mini={true}
        >
          <Popover
            open={this.state.showHelp}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onRequestClose={this.handleRequestClose}
            useLayerForClickAway={false}
            style={{
              width: this.props.smallScreen ? 300 : 400 ,
              overflowY: 'auto',
              height: 'auto',
              lineHeight: '20px'
            }}
          >
            <div style={{
              color: '#000000',
              marginLeft: 5,
              marginRight: 5,
              maxHeight: 400
            }}>
              <MarkdownRenderer content={getHelpDoc(this.props.location)} />
            </div>
          </Popover>
          <Ionicon
            icon="ion-help"
            fontSize="20px"
            color='#FFFFFF'
          />
        </FloatingActionButton>
      </div>
    );
  }
}

HelpButton.propTypes = {
  smallScreen: React.PropTypes.bool
}

export default withRouter(HelpButton);
