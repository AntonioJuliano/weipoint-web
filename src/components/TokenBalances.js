import React from 'react';
import paths from '../lib/ApiPaths';
import LRU from 'lru-cache';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import Divider from 'material-ui/Divider';

const balanceCache = LRU({
  max: 100,
  maxAge: 1000 * 60 * 5 // 5 minutes
});

class TokenBalances extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balances: []
    };

    this.getTokenBalances = this.getTokenBalances.bind(this);

    const cachedBalances = balanceCache.get(props.address);
    if (cachedBalances) {
      this.state = {
        balances: cachedBalances
      };
    } else {
      this.getTokenBalances(props.address);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.address !== this.props.address) {
      const cachedBalances = balanceCache.get(nextProps.address);
      if (cachedBalances) {
        this.setState({
          balances: cachedBalances
        });
      } else {
        this.setState({ balances: [] });
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
      this.setState({ balances: json.balances });
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

    return balances.map( (b, i) => {
      const divider = i !== balances.length - 1 ?
        <Divider style={dividerStyle} /> : null;

      if (b.isEth) {
        return (
          <div key='eth'>
            <Row>
              <Col xs={2} xsOffset={0} smOffset={2}>
                {b.symbol}
              </Col>
              <Col xs={6} style={{ textAlign: 'right', fontFamily: 'Roboto Mono' }}>
                {this.formatBalance(b)}
              </Col>
            </Row>
            {divider}
          </div>
        )
      }

      return (
        <div  key={ b.contractAddress }>
          <Row>
            <Col xs={2} xsOffset={0} smOffset={2}>
              <Link to={'/address/' + b.contractAddress} style={{ textDecoration: 'none' }}>
                {b.symbol}
              </Link>
            </Col>
            <Col xs={6} style={{ textAlign: 'right', fontFamily: 'Roboto Mono' }}>
              {this.formatBalance(b)}
            </Col>
          </Row>
          {divider}
        </div>
      );
    });
  }

  formatBalance(balance) {
    const formatted = new BigNumber(balance.balance)
      .dividedBy(new BigNumber('10e+' + (balance.decimals - 1)))
      .toFormat(8);

    const truncated = formatted.replace(/\.?0+$/, '');
    const numSpaces = formatted.length - truncated.length;

    // Want decimal places to be aligned so give all the same decimal spacing
    return truncated + '\u00a0'.repeat(numSpaces);
  }

  render() {
    return (
      <div>
        {this.getBalanceElements(this.state.balances)}
      </div>
    );
  }
}

TokenBalances.propTypes = {
  address: React.PropTypes.string.isRequired
}

export default TokenBalances;
