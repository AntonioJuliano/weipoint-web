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
import mixpanel from '../lib/Mixpanel';

const SEND_STATES = {
  INITIAL: 'INITIAL',
  CLICKED: 'CLICKED',
  CONFIRMING: 'CONFIRMING',
  SENDING: 'SENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED'
};

class TokenBalance extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sendState: SEND_STATES.INITIAL,
      sendValue: '',
      sendAddress: '',
      sendResult: null
    };

    this.getContent = this.getContent.bind(this);
    this.validateAmountInput = this.validateAmountInput.bind(this);
    this.validateAddressInput = this.validateAddressInput.bind(this);
    this.canSend = this.canSend.bind(this);
    this.send = this.send.bind(this);
  }

  validateAmountInput() {
    if (this.state.sendValue.trim() === '') {
      return null;
    }

    const decimals = this.props.balance.decimals;
    const rStr = decimals !== 0 ? '^[0-9]*(.[0-9]{1,num})?$'.replace('num', decimals) : '^[0-9]+$';
    const regex = new RegExp(rStr);
    if (!this.state.sendValue.trim().match(regex)) {
      return 'Invalid Amount';
    }

    if (!hasBalance(this.props.balance, this.state.sendValue.trim())) {
      return `You don't have that much`;
    }

    return null;
  }

  validateAddressInput() {
    if (this.state.sendAddress.trim() === '') {
      return null;
    }

    if (!this.props.web3.isAddress(this.state.sendAddress.trim())) {
      return 'Invalid Address';
    }

    return null;
  }

  canSend() {
    return (
      this.validateAmountInput() === null
      && this.validateAddressInput() === null
      && this.state.sendValue.trim() !== ''
      && this.state.sendAddress.trim() !== ''
    ) ? true : false;
  }

  async send() {
    try {
      this.setState({ sendState: SEND_STATES.SENDING });
      const sendResult = await sendToken(
        this.props.balance,
        this.state.sendValue.trim(),
        this.props.address,
        this.state.sendAddress.trim(),
        this.props.web3
      );
      this.setState({ sendState: SEND_STATES.APPROVED, sendResult: sendResult });

      mixpanel.track(
        "Token Send",
        {
          token: this.props.balance.symbol,
          txHash: sendResult
        }
      );

    } catch(e) {
      console.error(e);
      this.setState({ sendState: SEND_STATES.DENIED });
    }
  }

  getContent(sendState, balance) {
    const symbolElement = balance.isEth ? 'ETH' : (
      <Link to={'/address/' + balance.contractAddress} style={{ textDecoration: 'none' }}>
        {balance.symbol}
      </Link>
    );

    switch (sendState) {
      case SEND_STATES.INITIAL:
        return (
          <Row  style={{ height: 48 }}>
            <Col xs={2} smOffset={1} style={{ width: 52, marginTop: 'auto', marginBottom: 'auto' }}>
              {symbolElement}
            </Col>
            <Col xs={6} style={{
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
                    mixpanel.track(
                      "Token Send Start",
                      { "token": this.props.balance.symbol }
                    );
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
                hintText={'To'}
                errorText={this.validateAddressInput()}
                value={this.state.sendAddress}
                onChange={ (e, v) => this.setState({ sendAddress: v }) }
                style={{ width: '100%' }}
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
        return (
          <Row style={{ height: 48 }}>
            <Col xs={8} sm={7} smOffset={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ width: '100%', minWidth: '100%' }} >
                {'Confirm sending ' + this.state.sendValue + ' ' + balance.symbol}
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
