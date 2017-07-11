import React from 'react';
import UsernameBadge from './UsernameBadge';

class TwitterBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='#d4d8d4'
      textColor='#212121'
      image='/images/twitterLogo.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://www.twitter.com/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

TwitterBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default TwitterBadge;
