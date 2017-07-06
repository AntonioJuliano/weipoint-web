import React from 'react';
import UsernameBadge from './UsernameBadge';

class KeybaseBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='rgb(51, 160, 255)'
      textColor='rgb(255, 255, 255)'
      image='/images/keybaseLogo.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://www.keybase.io/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

KeybaseBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default KeybaseBadge;
