import React from 'react';
import UsernameBadge from './UsernameBadge';

class EthereumBadge extends React.Component {
  render() {
    return (
      <UsernameBadge
        username={this.props.address}
        link={this.props.link}
        backgroundColor='#3a3a3a'
        textColor='rgb(255, 255, 255)'
        image='/images/ethereum.png'
      />
    );
  }
}

EthereumBadge.propTypes = {
  address: React.PropTypes.string.isRequired,
  link: React.PropTypes.string
}

export default EthereumBadge;
