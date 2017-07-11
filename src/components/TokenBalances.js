import React from 'react';
import paths from '../lib/ApiPaths';
import LRU from 'lru-cache';
import Divider from 'material-ui/Divider';
import TokenBalance from './TokenBalance';
import RefreshIndicator from 'material-ui/RefreshIndicator';

const balanceCache = LRU({
  max: 100,
  maxAge: 1000 * 60 * 5 // 5 minutes
});

const REQUEST_STATES = {
  INITIAL: 'INITIAL',
  COMPLETED: 'COMPLETED'
};

class TokenBalances extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balances: [],
      requestState: REQUEST_STATES.INITIAL
    };

    this.getTokenBalances = this.getTokenBalances.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const cachedBalances = balanceCache.get(this.props.address);
    if (cachedBalances) {
      this.state = {
        balances: cachedBalances,
        requestState: REQUEST_STATES.COMPLETED
      };
    } else {
      this.getTokenBalances(this.props.address);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.address !== this.props.address) {
      const cachedBalances = balanceCache.get(nextProps.address);

      if (cachedBalances) {
        this.setState({
          balances: cachedBalances,
          requestState: REQUEST_STATES.COMPLETED
        });
      } else {
        this.setState({ balances: [], requestState: REQUEST_STATES.INITIAL });
        this.getTokenBalances(nextProps.address);
      }
    }
  }

  async getTokenBalances(address) {
    const requestPath = paths.address.tokenBalances + '?address=' + address;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        return;
      }
      const json = await response.json();

      balanceCache.set(address, json.balances);

      if (this.mounted) {
        this.setState({ balances: json.balances, requestState: REQUEST_STATES.COMPLETED });
      }
    } catch(e) {
      console.error(e);
    }
  }

  getBalanceElements(balances) {
    const dividerStyle = {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '90%',
      marginTop: 10,
      marginBottom: 10
    };

    const thisRef = this;

    return balances.map( (b, i) => {
      const divider = i !== balances.length - 1 ?
        <Divider style={dividerStyle} /> : null;

      return (
        <div key={b.isEth ? 'eth' : b.contractAddress}>
          <TokenBalance
            balance={b}
            isUserAccount={thisRef.props.isUserAccount}
            web3={thisRef.props.web3}
            address={this.props.address}
          />
          {divider}
        </div>
      );
    });
  }

  render() {
    let content;
    switch (this.state.requestState) {
      case REQUEST_STATES.INITIAL:
        content = (
          <div style={{ width: '100%' }}>
            <RefreshIndicator
              size={50}
              left={0}
              top={0}
              loadingColor="#9b59b6"
              status="loading"
              style={{
                position: 'relative',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 50
              }}
            />
          </div>
        );
        break;
      case REQUEST_STATES.COMPLETED:
        content = this.getBalanceElements(this.state.balances);
        break;
      default:
        console.error('Invalid requestState ' + this.state.requestState);
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}

TokenBalances.propTypes = {
  address: React.PropTypes.string.isRequired,
  web3: React.PropTypes.object.isRequired,
  isUserAccount: React.PropTypes.bool
}

export default TokenBalances;
