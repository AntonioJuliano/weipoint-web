import React from 'react';
import UsernameBadge from './UsernameBadge';

class FacebookBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='#3b5998'
      textColor='#dfe3ee'
      image='/images/facebook-f.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://facebook.com/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

FacebookBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default FacebookBadge;
