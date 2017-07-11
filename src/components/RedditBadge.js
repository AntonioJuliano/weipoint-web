import React from 'react';
import UsernameBadge from './UsernameBadge';

class RedditBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='#ff4500'
      textColor='#212121'
      image='/images/redditLogo.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://www.reddit.com/user/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

RedditBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default RedditBadge;
