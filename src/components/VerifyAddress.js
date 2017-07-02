import React from 'react';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import { Row, Col } from 'react-flexbox-grid';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Editor from './Editor';
import TextField from 'material-ui/TextField';
import { verifySignature, getPublicKey } from '../helpers/Keybase';
import CircularProgress from 'material-ui/CircularProgress';
import CheckCircleIcon from 'react-material-icons/icons/action/check-circle';
import CancelIcon from 'react-material-icons/icons/navigation/cancel';
import { green500, red600 } from 'material-ui/styles/colors';
import bluebird from 'bluebird';
import ethUtil from 'ethereumjs-util';
import CopyButton from './CopyButton';

const FORM_STATES = {
  OVERVIEW: 1,
  FORM: 2
}

const VERIFICATION_STATES = {
  NOT_VERIFYING: 0,
  VERIFYING: 1,
  VERIFIED: 2,
  FAILED: 3
}

class VerifyAddress extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formState: FORM_STATES.OVERVIEW,
      stepIndex: 2,
      visited: [],
      keybaseUsername: '',
      keybaseUsernameVerificationState: VERIFICATION_STATES.NOT_VERIFYING,
      keybaseUsernameError: '',
      keybaseSignature: '',
      keybaseSignatureError: '',
      keybaseVerificationState: VERIFICATION_STATES.NOT_VERIFYING,
      walletSignatureError: '',
      walletVerificationState: VERIFICATION_STATES.NOT_VERIFYING,
      walletSignature: '',
    };

    this.verifyKeybaseSignature = this.verifyKeybaseSignature.bind(this);
    this.getStepContent = this.getStepContent.bind(this);
    this.getKeybaseVerificationResult = this.getKeybaseVerificationResult.bind(this);
    this.getWalletVerificationResult = this.getWalletVerificationResult.bind(this);
    this.getKeybaseUsernameVerificationResult = this.getKeybaseUsernameVerificationResult.bind(this);
    this.getMessageToSign = this.getMessageToSign.bind(this);
    this.requestWalletSignature = this.requestWalletSignature.bind(this);
    this.verifyKeybaseUsername = this.verifyKeybaseUsername.bind(this);
    this.validateKeybaseUsername = this.validateKeybaseUsername.bind(this);
  }

  async verifyKeybaseUsername(username) {
    this.setState({ keybaseUsernameVerificationState: VERIFICATION_STATES.VERIFYING });
    try {
      const response = await getPublicKey(username);

      // If this check isn't for the current input, ignore it
      if (username !== this.state.keybaseUsername) {
        return;
      }

      if (!response.ok) {
        this.setState({
          keybaseUsernameVerificationState: VERIFICATION_STATES.FAILED,
          keybaseUsernameError: response.message
        });
      } else if (username) {
        this.setState({
          keybaseUsernameVerificationState: VERIFICATION_STATES.VERIFIED
        });
        setTimeout(() => this.setState({ stepIndex: 1 }), 2000);
      }
    } catch (e) {
      this.setState({
        keybaseUsernameVerificationState: VERIFICATION_STATES.FAILED,
        keybaseUsernameError: `We could not validate your Keybase account. Please
        check your username and try again`
      });
    }
  }

  async verifyKeybaseSignature(signature) {
    try {
      const result = await verifySignature(signature,
        this.state.keybaseUsername,
        this.getMessageToSign());

      // If this check isn't for the current input, ignore it
      if (result.signature !== this.state.keybaseSignature) {
        return;
      }

      if (result.ok) {
        this.setState({ keybaseVerificationState: VERIFICATION_STATES.VERIFIED});
        setTimeout(() => this.setState({ stepIndex: 2 }), 2000);
      } else {
        this.setState({
          keybaseVerificationState: VERIFICATION_STATES.FAILED,
          keybaseSignatureError: result.message
        });
      }
    } catch(e) {
      console.error(e);
      this.setState({
        keybaseVerificationState: VERIFICATION_STATES.FAILED,
        keybaseSignatureError: `Unexpected Error. Please check your inputs and try again.
        If this error persists please contact support@weipoint.com`
      });
    }
  }

  async requestWalletSignature() {
    if (!this.props.web3.isConnected()) {
      this.setState({
        walletVerificationState: VERIFICATION_STATES.FAILED,
        walletSignatureError: 'No Ethereum wallet detected. '
      });
    }

    try {
      // web3 eth.sign is deprecated in favor of this
      const func = this.props.web3.currentProvider.sendAsync;
      const encodedMessage = ethUtil.bufferToHex(new Buffer(this.getMessageToSign(), 'utf8'))
      const asyncFunc = bluebird.promisify(func);
      const result = await asyncFunc({
        method: 'personal_sign',
        params: [encodedMessage, this.props.address],
        from: this.props.address,
      });

      console.log(result);

      if (result.error) {
        this.setState({ walletVerificationState: VERIFICATION_STATES.FAILED });
      }
      const signature = result.result;
      this.setState({
        walletVerificationState: VERIFICATION_STATES.VERIFIED,
        walletSignature: signature
      });
    } catch(e) {
      console.error(e);
      this.setState({ walletVerificationState: VERIFICATION_STATES.FAILED });
    }
  }

  getMessageToSign() {
    let message = '';
    const messageHeader = 'Weipoint address verification [Ethereum/Keybase]: ';
    message += messageHeader;
    message += this.props.address;
    message += ' - ';
    message += this.state.keybaseUsername;
    return message;
  }

  validateKeybaseUsername() {
    if (!this.state.keybaseUsername.match(/^[a-zA-Z0-9]*$/)) {
      return 'Invalid Username';
    }

    return '';
  }

  // ------ Presentational Functions ------

  getContent(formState) {
    switch (formState) {
      case FORM_STATES.OVERVIEW:
        return this.getOverviewContent();
      case FORM_STATES.FORM:
        return this.getFormContent();
      default:
        return null;
    }
  }

  getOverviewContent() {
    const overviewMessage = `Verify you are the owner of this address by linking it with a Keybase
    account. Keybase accounts can then be linked with Github, Facebook, and other common internet
    accounts. We use cryptographic signatures, so anyone can provably verify your keybase account
    owns this address. We will create a message which you will need to sign with both your Keybase
    account and your Ethereum wallet. If you create any contracts using this address Weipoint will
    automatically display your Keybase account on those contracts,
    making it easy for users to trust its authenticity.`;

    return (
      <div style={{ width: '100%' }}>
        <Row style={{ fontSize: 20, textAlign: 'center', marginTop: 25 }} center='xs'>
          <Col xs={10}>
            {'Verify Ownership'}
          </Col>
        </Row>
        <Row
          style={{
            fontSize: 16,
            textAlign: 'left',
            marginTop: 32,
            lineHeight: 1.3
          }}
          center='xs'
        >
          <Col xs={10}>
            {overviewMessage}
          </Col>
        </Row>
        <Row style={{ marginTop: 32 }} center='xs'>
          <Col xs={5}>
            <RaisedButton
              label='Start'
              primary={true}
              onTouchTap={ () => this.setState({ formState: FORM_STATES.FORM })}
            />
          </Col>
        </Row>
      </div>
    );
  }

  getFormContent() {
    return (
      <div>
        <Row center='xs'>
          <Col xs={8} md={6}>
            <Stepper linear={false} activeStep={this.state.stepIndex} style={{ height: 60 }}>
              <Step
                completed={this.state.visited.indexOf(0) !== -1 && this.state.stepIndex !== 0}
                active={this.state.stepIndex === 0}
              >
                <StepButton onClick={() => this.setState({stepIndex: 0})}>
                  Keybase ID
                </StepButton>
              </Step>
              <Step
                completed={this.state.visited.indexOf(1) !== -1 && this.state.stepIndex !== 1}
                active={this.state.stepIndex === 1}
                disabled={
                  this.state.keybaseUsernameVerificationState !== VERIFICATION_STATES.VERIFIED
                }
              >
                <StepButton onClick={() => this.setState({stepIndex: 1})}>
                  Keybase Signature
                </StepButton>
              </Step>
              <Step
                completed={this.state.visited.indexOf(2) !== -1 && this.state.stepIndex !== 2}
                active={this.state.stepIndex === 2}
                disabled={
                  this.state.keybaseVerificationState !== VERIFICATION_STATES.VERIFIED ||
                  this.state.keybaseUsernameVerificationState !== VERIFICATION_STATES.VERIFIED
                }
              >
                <StepButton onClick={() => this.setState({stepIndex: 2})}>
                  Ethereum Signature
                </StepButton>
              </Step>
            </Stepper>
          </Col>
        </Row>
        <div>
          <Row center='xs'>
            <Col xs={10}>
              {this.getStepContent(this.state.stepIndex)}
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return this.getKeybaseUsernameFormContent();
      case 1:
        return this.getKeybaseSignatureFormContent();
      case 2:
        return this.getWalletSignatureFormContent();
      default:
        return null;
    }
  }

  // ----- Keybase Username Form ------

  getKeybaseUsernameFormContent() {
    return (
      <div>
        <Row center='xs' style={{ textAlign: 'left' }}>
          <p>
            To prove ownership of your address you will first need a Keybase account.
            If you don't have one, you can get one here:
          </p>
        </Row>
        <Row center='xs'>
          <div style={{ display: 'flex' }}>
            <a href='https://keybase.io' target='_blank' style={{ display: 'flex' }}>
              <img src='/images/keybaseLogo.png' width={40} height={40} role='presentation' />
              <div style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 10 }}>
                keybase.io
              </div>
            </a>
          </div>
        </Row>
        <Row center='xs' style={{ textAlign: 'left' }}>
          <p>
            After you have your account you need to add a PGP key to it. If you don't have one
            already, you can add one by clicking "add a PGP key" on your Keybase account page.
          </p>
        </Row>
        <Row center='xs'>
          <p style={{ marginBottom: 0 }}>
            Please input your Keybase account name below
          </p>
        </Row>
        <Row center='xs'>
          <TextField
            floatingLabelText='Keybase Username'
            value={this.state.keybaseUsername}
            spellCheck="false"
            autoCorrect="off"
            autoComplete='off'
            autoCapitalize="off"
            onChange={ (e, v) => this.setState({
              keybaseUsername: v,
              keybaseUsernameVerificationState: VERIFICATION_STATES.NOT_VERIFYING
            })}
            errorText={ this.validateKeybaseUsername() }
          />
        </Row>
        <Row center='xs' style={{ marginTop: 30 }}>
          <Col xs={10}>
            {this.getKeybaseUsernameVerificationResult()}
          </Col>
        </Row>
      </div>
    );
  }

  getKeybaseUsernameVerificationResult() {
    switch (this.state.keybaseUsernameVerificationState) {
      case VERIFICATION_STATES.NOT_VERIFYING:
        return (
          <RaisedButton
            label='Next'
            primary={true}
            onTouchTap={ () => this.verifyKeybaseUsername(this.state.keybaseUsername) }
            disabled={this.state.keybaseUsername === '' || this.validateKeybaseUsername() !== ''}
          />
        );
      case VERIFICATION_STATES.FAILED:
        return (
          <div style={{ marginTop: 10 }}>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CancelIcon style={{ width: 72, height: 72 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {this.state.keybaseUsernameError}
              </p>
            </Row>
            <Row center='xs'>
              <RaisedButton
                label='Next'
                primary={true}
                onTouchTap={ () => this.verifyKeybaseUsername(this.state.keybaseUsername) }
                disabled={this.state.keybaseUsername === '' || this.validateKeybaseUsername() !== ''}
              />
            </Row>
          </div>
        );
      case VERIFICATION_STATES.VERIFIED:
        return this.getVerified();
      case VERIFICATION_STATES.VERIFYING:
        return this.getVerifying();
      default:
        return null;
    }
  }

  // ------ Keybase Signature Form ------

  getKeybaseSignatureFormContent() {
    const listSpacing = 8;
    return (
      <div>
        <Row center='xs' style={{ textAlign: 'left' }}>
          <Row>
            <p>
              The next step is to sign a message declaring you own this address
              with your Keybase account. Follow the steps below:
            </p>
          </Row>
          <Row>
            <ol>
              <li style={{ marginBottom: listSpacing}}>
                Click the button on the left to copy the message
              </li>
              <li style={{ marginBottom: listSpacing}}>
                Click the link on the right to navigate to Keybase where you
                can sign the message
              </li>
              <li style={{ marginBottom: listSpacing}}>
                Paste the message into the keybase sign box, put in your Keybase password
                and click sign
              </li>
              <li>
                Copy the entire signature generated by Keybase and paste it into
                the box below
              </li>
            </ol>
          </Row>
          <Row center='xs'>
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <div style={{ marginRight: 35, marginTop: 'auto', marginBottom: 'auto' }}>
                <CopyButton
                  label='Copy Message'
                  copyValue={this.getMessageToSign()}
                />
              </div>
              <a
                href='https://keybase.io/sign'
                target='_blank'
                style={{ display: 'flex', marginTop: 'auto', marginBottom: 'auto' }}
              >
                <img src='/images/keybaseLogo.png' width={40} height={40} role='presentation' />
                <div style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 10 }}>
                  keybase.io/sign
                </div>
              </a>
            </div>
          </Row>
          <Col xs={10}>
            <Paper style={{ width: '100%', height: 300, overflowY: 'auto' }} zDepth={2}>
              <Editor
                readOnly={false}
                name='keybaseSignature'
                mode='none'
                showGutter={false}
                value={this.state.keybaseSignature}
                onChange={ v => {
                  if (v.trim() === '') {
                    this.setState({
                      keybaseSignature: v,
                      keybaseVerificationState: VERIFICATION_STATES.NOT_VERIFYING
                    });
                    return;
                  }

                  this.setState({
                    keybaseSignature: v,
                    keybaseVerificationState: VERIFICATION_STATES.VERIFYING
                  });
                  this.verifyKeybaseSignature(v);
                }}
              />
            </Paper>
          </Col>
        </Row>
        <Row center='xs'>
          <Col xs={10}>
            {this.getKeybaseVerificationResult()}
          </Col>
        </Row>
      </div>
    );
  }

  getKeybaseVerificationResult() {
    switch (this.state.keybaseVerificationState) {
      case VERIFICATION_STATES.NOT_VERIFYING:
        return null;
      case VERIFICATION_STATES.VERIFYING:
        return this.getVerifying();
      case VERIFICATION_STATES.VERIFIED:
        return this.getVerified();
      case VERIFICATION_STATES.FAILED:
        return (
          <div style={{ marginTop: 10 }}>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CancelIcon style={{ width: 72, height: 72 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {this.state.keybaseSignatureError}
              </p>
            </Row>
          </div>
        );
      default:
        return null;
    }
  }

  // ----- Wallet Signature Form ------

  getWalletSignatureFormContent() {
    return (
      <div>
        <Row center='xs' style={{ textAlign: 'left' }}>
          <p>
            The final step is to sign the message with your Ethereum address.
            Click the button below to sign
          </p>
        </Row>
        <Row center='xs' style={{ marginTop: 25 }}>
          <Col xs={10}>
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <RaisedButton
                label='Sign with Wallet'
                primary={true}
                onTouchTap={this.requestWalletSignature}
              />
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  getWalletVerificationResult() {
    switch (this.state.walletVerificationState) {
      case VERIFICATION_STATES.NOT_VERIFYING:
        return null;
      case VERIFICATION_STATES.FAILED:
        return (
          <div style={{ marginTop: 10 }}>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CancelIcon style={{ width: 72, height: 72 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {'Signing failed. Please try again'}
              </p>
            </Row>
          </div>
        );
      case VERIFICATION_STATES.VERIFIED:
        return (
          <div style={{ marginTop: 10 }}>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CheckCircleIcon style={{ width: 72, height: 72 }} color={green500} />
                </div>
              </Col>
            </Row>
          </div>
        );
      default:
        return null;
    }
  }

  getVerifying() {
    return (
      <div>
        <Row center='xs'>
          <Col xs={4}>
            <div
              style={{
                marginTop: 10,
                marginRight: 'auto',
                marginLeft: 'auto'
              }}
              >
              <CircularProgress
                size={60}
                thickness={6} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  getVerified() {
    return (
      <div style={{ marginTop: 10 }}>
        <Row center='xs'>
          <Col xs={4}>
            <div
              style={{
                marginTop: 10,
                marginRight: 'auto',
                marginLeft: 'auto'
              }}
              >
              <img src='/images/checkmark2.gif' width={72} height={72} role='presentation' />
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    return (
      <div style={{ marginBottom: 20 }}>
        {this.getContent(this.state.formState)}
      </div>
    );
  }
}

VerifyAddress.propTypes = {
  address: React.PropTypes.string.isRequired,
  web3: React.PropTypes.object.isRequired
};

export default VerifyAddress;
