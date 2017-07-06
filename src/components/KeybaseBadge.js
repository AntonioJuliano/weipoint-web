import React from 'react';
import UsernameBadge from './UsernameBadge';

class KeybaseBadge extends React.Component {
  render() {
    return (
      <UsernameBadge
        username={this.props.username}
        link={this.props.link}
        backgroundColor='rgb(51, 160, 255)'
        textColor='rgb(255, 255, 255)'
        image='/images/keybaseLogo.png'
      />
    );
  }
}

KeybaseBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.string
}

export default KeybaseBadge;
