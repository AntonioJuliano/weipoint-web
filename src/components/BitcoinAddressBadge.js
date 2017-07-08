import React from 'react';
import UsernameBadge from './UsernameBadge';

class BitcoinAddressBadge extends React.Component {
  render() {
    const shortAddress = this.props.username.substr(0, 10) + '...';
    const badge = <UsernameBadge
      username={shortAddress}
      link={this.props.link}
      backgroundColor='#3a3a3a'
      textColor='rgb(255, 255, 255)'
      image='/images/bitcoinLogo.png'
    />;
    if (!this.props.link) {
      return badge;
    }
    return (
      <a
        href={'https://blockchain.info/address/' + this.props.username}
        target='_blank'
        style={{ textDecoration: 'none' }}
      >
        {badge}
      </a>
    );
  }
}

BitcoinAddressBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool
}

export default BitcoinAddressBadge;
