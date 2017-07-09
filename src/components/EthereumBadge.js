import React from 'react';
import UsernameBadge from './UsernameBadge';
import { Link } from 'react-router-dom';

class EthereumBadge extends React.Component {
  render() {
    const badge = <UsernameBadge
      username={this.props.address}
      link={this.props.link}
      backgroundColor='#3a3a3a'
      textColor='rgb(255, 255, 255)'
      image='/images/ethereum.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <Link
        to={'/address/' + this.props.address}
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </Link>
    );
  }
}

EthereumBadge.propTypes = {
  address: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default EthereumBadge;
