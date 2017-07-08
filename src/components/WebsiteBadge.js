import React from 'react';
import UsernameBadge from './UsernameBadge';

class WebsiteBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.username}
      link={this.props.link}
      backgroundColor='#efefef'
      textColor='#212121'
      image={'/images/websiteIcon.png'}
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'http://' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

WebsiteBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default WebsiteBadge;
