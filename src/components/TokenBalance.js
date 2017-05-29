import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Send from 'material-ui/svg-icons/content/send';
import Check from 'material-ui/svg-icons/navigation/check';
import Close from 'material-ui/svg-icons/navigation/close';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';
import {
  sendToken,
  formatBalance,
  hasBalance,
} from '../lib/services/tokenService';
import TextField from 'material-ui/TextField';
import { trackEvent } from '../lib/Analytics';
import paths from '../lib/ApiPaths';
import { isEnsDomain } from '../lib/services/ensService';
import BigNumber from 'bignumber.js';

const SEND_STATES = {
  INITIAL: 'INITIAL',
  CLICKED: 'CLICKED',
  CONFIRMING: 'CONFIRMING',
  SENDING: 'SENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED'
};

const RESOLVER_STATES = {
  RESOLVING: 'RESOLVING',
  RESOLVED: 'RESOLVED'
};

class TokenBalance extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sendState: SEND_STATES.INITIAL,
      sendValue: '',
      sendTo: '',
      sendResult: null,
      resolvedAddress: '',
      resolverState: null,
      showIcon: true
    };

    this.getContent = this.getContent.bind(this);
    this.validateAmountInput = this.validateAmountInput.bind(this);
    this.validateToInput = this.validateToInput.bind(this);
    this.canSend = this.canSend.bind(this);
    this.send = this.send.bind(this);
    this.resolve = this.resolve.bind(this);

    this.resolver = {
      to: null,
      resolvedAddress: null
    };
    this.destinationAddress = '';
  }

  validateAmountInput() {
    const value = this.state.sendValue.trim();
    if (value === '') {
      return null;
    }

    const decimals = this.props.balance.decimals;
    const rStr = decimals !== 0 ? '^[0-9]*(\\.[0-9]{1,num})?$'.replace('num', decimals) : '^[0-9]+$';
    const regex = new RegExp(rStr);
    if (!value.match(regex)) {
      return 'Invalid Amount';
    }


    if (new BigNumber(value).comparedTo(new BigNumber(0)) < 1) {
      return 'Invalid Amount';
    }

    if (!hasBalance(this.props.balance, value)) {
      return `You don't have that much`;
    }

    return null;
  }

  validateToInput() {
    const to = this.state.sendTo.trim();
    if (to === '') {
      return null;
    }

    // ENS Domain
    if (isEnsDomain(to)) {

      if (this.resolver.to !== to) {
        this.resolver.to = to;
        this.resolve(to);
      }

      if (this.state.resolverState === RESOLVER_STATES.RESOLVING) {
        return 'Resolving...';
      } else if (this.state.resolverState === RESOLVER_STATES.RESOLVED) {
        if (this.props.web3.isAddress(this.resolver.resolvedAddress)) {
          return null;
        } else {
          return 'Invalid Domain';
        }
      } else {
        return 'Invalid';
      }
    }

    if (!this.props.web3.isAddress(to)) {
      return 'Invalid Destination';
    }

    this.destinationAddress = to;

    return null;
  }

  canSend() {
    return (
      this.validateAmountInput() === null
      && this.validateToInput() === null
      && this.state.sendValue.trim() !== ''
      && this.state.sendTo.trim() !== ''
    ) ? true : false;
  }

  async resolve(to) {
    const requestPath = paths.ens.get + `?domain=${to}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        throw new Error('Invalid response');
      }
      const json = await response.json();

      if (this.resolver.to === to) {
        this.resolver.resolvedAddress = json.address;
        this.destinationAddress = json.address;
        this.setState({ resolverState: RESOLVER_STATES.RESOLVED });
      }
    } catch(e) {
      console.error(e);
      this.setState({ resolverState: RESOLVER_STATES.RESOLVED });
    }
  }

  async send() {
    try {
      this.setState({ sendState: SEND_STATES.SENDING });
      const sendResult = await sendToken(
        this.props.balance,
        this.state.sendValue.trim(),
        this.props.address,
        this.destinationAddress,
        this.props.web3
      );
      this.setState({ sendState: SEND_STATES.APPROVED, sendResult: sendResult });

      trackEvent({
        category: 'Wallet',
        action: 'Token Send',
        label: this.props.balance.symbol,
      });
    } catch(e) {
      console.error(e);
      this.setState({ sendState: SEND_STATES.DENIED });
    }
  }

  getContent(sendState, balance) {
    let imgStyle = {
      width: 20,
      height: 20,
      marginRight: 5,
      minWidth: 20,
      maxWidth: 20,
      minHeight: 20,
      maxHeight: 20
    };
    if (!this.state.showIcon) {
      imgStyle.visibility = 'hidden';
      imgStyle.height = 0;
      imgStyle.minHeight = 0;
      imgStyle.maxHeight = 0;
      imgStyle.width = 0;
      imgStyle.minWidth = 0;
      imgStyle.maxWidth = 0;
      imgStyle.marginRight = 0;
    }
    const thisRef = this;
    const imgName = balance.isEth ? 'eth' : balance.contractAddress;
    console.log(imgName)
    const img = (
      <img
        src={'tokens/' + imgName + '.png'}
        style={imgStyle}
        onError={ () => thisRef.setState({ showIcon: false })}
        alt=''
      >
      </img>
    );
    let symbolElement = (
      <div style={{ display: 'flex' }}>
        {img}
        {balance.symbol}
      </div>
    );

    if (!balance.isEth) {
      symbolElement = (
        <Link
          to={'/address/' + balance.contractAddress}
          style={{ textDecoration: 'none', marginTop: 'auto', marginBottom: 'auto' }}
        >
          {symbolElement}
        </Link>
      );
    }

    switch (sendState) {
      case SEND_STATES.INITIAL:
        return (
          <Row  style={{ height: 48 }}>
            <Col xs={3} sm={2} smOffset={1} style={{ width: 52, marginTop: 'auto', marginBottom: 'auto' }}>
              {symbolElement}
            </Col>
            <Col xs={5} style={{
              overflowX: 'auto',
              textAlign: 'right',
              fontFamily: 'Roboto Mono',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}>
              {formatBalance(this.props.balance)}
            </Col>
            {
              this.props.isUserAccount &&
              <Col xs={2}  mdOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <FlatButton
                  label="Send"
                  labelPosition="before"
                  primary={true}
                  icon={<Send />}
                  onTouchTap={ () => {
                    this.setState({ sendState: SEND_STATES.CLICKED });
                    trackEvent({
                      category: 'Wallet',
                      action: 'Token Send Start',
                      label: this.props.balance.symbol,
                    });
                  }}
                />
              </Col>
            }
          </Row>
        );
      case SEND_STATES.CLICKED:
        return (
          <Row style={{ height: 48 }}>
            <Col xs={4} md={3} smOffset={1} >
              <TextField
                hintText={'Amount'}
                errorText={this.validateAmountInput()}
                value={this.state.sendValue}
                onChange={ (e, v) => this.setState({ sendValue: v }) }
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={4}>
              <TextField
                hintText={'To (address or .eth domain)'}
                errorText={this.validateToInput()}
                value={this.state.sendTo}
                onChange={ (e, v) => this.setState({
                  sendTo: v,
                  resolverState: RESOLVER_STATES.RESOLVING })
                }
                style={{ width: '100%' }}
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                hintStyle={{
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              />
            </Col>
            <Col
              xs={4}
              sm={2}
              mdOffset={1}
              style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex' }}
            >
              <FlatButton
                backgroundColor='#66BB6A'
                hoverColor='#4CAF50'
                icon={<Check />}
                disabled={!this.canSend()}
                onTouchTap={ () => this.setState({ sendState: SEND_STATES.CONFIRMING }) }
                style={{ width: 40, minWidth: 40 }}
              />
              <FlatButton
                backgroundColor='#FF5252'
                hoverColor='#F44336'
                icon={<Close />}
                onTouchTap={ () => this.setState({ sendState: SEND_STATES.INITIAL }) }
                style={{ width: 40, minWidth: 40, marginLeft: 10 }}
              />
            </Col>
          </Row>
        );
      case SEND_STATES.CONFIRMING:
        const dest = isEnsDomain(this.state.sendTo) ?
          this.state.sendTo + ' (' + this.destinationAddress + ')' :
          this.destinationAddress;
        return (
          <Row style={{ height: 48 }}>
            <Col xs={8} sm={7} smOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{
                  width: '100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                  overflowY: 'auto',
                  maxHeight: '100%'
                }}
              >
                {'Confirm sending ' + this.state.sendValue + ' ' + balance.symbol + ' to ' + dest}
              </div>
            </Col>
            <Col
              xs={3}
              mdOffset={1}
              style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex' }}
            >
              <FlatButton
                backgroundColor='#66BB6A'
                hoverColor='#4CAF50'
                icon={<Check />}
                disabled={!this.canSend()}
                onTouchTap={this.send}
                style={{ width: 40, minWidth: 40 }}
              />
              <FlatButton
                backgroundColor='#FF5252'
                hoverColor='#F44336'
                icon={<Close />}
                onTouchTap={ () => this.setState({ sendState: SEND_STATES.INITIAL }) }
                style={{ width: 40, minWidth: 40, marginLeft: 10 }}
              />
            </Col>
          </Row>
        );
      case SEND_STATES.SENDING:
        return (
          <Row style={{ height: 48 }}>
            <Col xs={8} sm={7} smOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ width: '100%', minWidth: '100%' }} >
                {'Sending... please approve in your wallet'}
              </div>
            </Col>
          </Row>
        );
      case SEND_STATES.APPROVED:
        return (
          <Row style={{ height: 48 }}>
            <Col xs={2} sm={2} smOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ width: '100%', minWidth: '100%' }} >
                {'Sent'}
              </div>
            </Col>
            <Col
              xs={10}
              sm={6}
              md={5}
              smOffset={2}
              mdOffset={3}
              style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex' }}
            >
              <a
                href={'https://etherscan.io/tx/' + this.state.sendResult}
                target='_blank'
              >
                <FlatButton
                  label='View Transaction'
                  primary={true}
                />
              </a>
              <FlatButton
                icon={<Check />}
                onTouchTap={ () => this.setState({ sendState: SEND_STATES.INITIAL }) }
                style={{ width: 40, minWidth: 40, marginLeft: 10 }}
              />
            </Col>
          </Row>
        );
      case SEND_STATES.DENIED:
      return (
        <Row style={{ height: 48 }}>
          <Col xs={8} sm={7} smOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ width: '100%', minWidth: '100%' }} >
              {'Transaction canceled'}
            </div>
          </Col>
          <Col
            xs={4}
            mdOffset={1}
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
          >
            <FlatButton
              icon={<Check />}
              onTouchTap={ () => this.setState({ sendState: SEND_STATES.INITIAL }) }
              style={{ width: 40, minWidth: 40, marginLeft: 10 }}
            />
          </Col>
        </Row>
      );
      default:
        return null;
    }
  }

  render() {
    return this.getContent(this.state.sendState, this.props.balance) ;
  }
}

TokenBalance.propTypes = {
  balance: React.PropTypes.object.isRequired,
  web3: React.PropTypes.object.isRequired,
  isUserAccount: React.PropTypes.bool,
  address: React.PropTypes.string.isRequired
};

export default TokenBalance;
