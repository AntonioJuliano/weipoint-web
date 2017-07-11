import React from 'react';
import UsernameBadge from './UsernameBadge';

class GithubBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='#dbdbdb'
      textColor='#232323'
      image='/images/github.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://github.com/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

GithubBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default GithubBadge;
