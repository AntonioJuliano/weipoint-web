import React from 'react';
import FetchAddress from './FetchAddress';
import SearchStatus from './SearchStatus';

class Wallet extends React.Component {
  render() {
    if (!this.props.isLoaded) {
      return null;
    } else {
      if (this.props.userAddress === 'loading') {
        return null;
      } else if (this.props.userAddress === 'none') {
        return (
          <div>
            <SearchStatus
              icon={<a href='https://metamask.io/' target='_blank'>
                  <img
                    src={'metamask.png'}
                    alt='Download MetaMask'
                    width={200}
                  >
                  </img>
                </a>
              }
              message={
                <div>
                  <div>
                    {'An Ethereum wallet is required. We recommend MetaMask'}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12 }}>
                    {'If you have a wallet, please make sure it is unlocked'}
                  </div>
                </div>
              }
            />
          </div>
        );
      } else {
        return (
          <FetchAddress
            web3={this.props.web3}
            contractStore={this.props.contractStore}
            userAccount={this.props.userAddress}
            address={this.props.userAddress}
          />
        );
      }
    }
  }
}

Wallet.propTypes = {
  isLoaded: React.PropTypes.bool,
  userAddress: React.PropTypes.string,
  contractStore: React.PropTypes.object.isRequired,
  web3: React.PropTypes.object.isRequired,
};

export default Wallet;
