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
import { verifySignature, getPublicKey, getUser } from '../helpers/Keybase';
import CircularProgress from 'material-ui/CircularProgress';
import CancelIcon from 'react-material-icons/icons/navigation/cancel';
import { red600 } from 'material-ui/styles/colors';
import bluebird from 'bluebird';
import ethUtil from 'ethereumjs-util';
import CopyButton from './CopyButton';
import Forward from 'material-ui/svg-icons/content/forward';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import FlatButton from 'material-ui/FlatButton';
import KeybaseBadge from './KeybaseBadge';
import EthereumBadge from './EthereumBadge';
import { Link } from 'react-router-dom';
import paths from '../lib/ApiPaths';
import Dialog from 'material-ui/Dialog';
import JSONPretty from 'react-json-pretty';

const FORM_STATES = {
  OVERVIEW: 1,
  FORM: 2,
  CONFIRMATION: 3
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
      stepIndex: 0,
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
      sendToServerState: 0,
      timestamp: new Date().getTime(),
      showProof: false,
      keybaseUser: null
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
    this.sendVerificationToServer = this.sendVerificationToServer.bind(this);
    this.getServerRequest = this.getServerRequest.bind(this);
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
        const user = await getUser(username);
        this.setState({
          keybaseUser: user,
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
    const walletMissingError = `No Ethereum wallet detected. Please visit this page with your web3
    enabled wallet such as MetaMask or Mist in which you store this address.`;

    if (!this.props.web3.isConnected()) {
      this.setState({
        walletVerificationState: VERIFICATION_STATES.FAILED,
        walletSignatureError: walletMissingError
      });
      return;
    }

    const userAccounts = await this.props.web3.eth.getAccountsAsync();

    if (!userAccounts || !userAccounts.includes(this.props.address)) {
      this.setState({
        walletVerificationState: VERIFICATION_STATES.FAILED,
        walletSignatureError: `Your wallet does not contain this address. Please visit this page
        with your web3 enabled wallet in which you store this address.`
      });
      return;
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

      if (result.error) {
        this.setState({ walletVerificationState: VERIFICATION_STATES.FAILED });
      } else {
        const signature = result.result;
        this.setState({
          walletVerificationState: VERIFICATION_STATES.VERIFIED,
          walletSignature: signature,
          sendToServerState: 1
        });
        this.sendVerificationToServer();
        setTimeout(() => this.setState({ formState: FORM_STATES.CONFIRMATION }), 2000);
      }
    } catch(e) {
      console.error(e);
      this.setState({ walletVerificationState: VERIFICATION_STATES.FAILED });
    }
  }

  getMessageToSign() {
    const jsonMessage = {
      verifier: 'weipoint',
      type: 'link',
      services: [
        {
          type: 'keybase',
          userID: this.state.keybaseUsername
        },
        {
          type: 'ethereum_address',
          userID: this.props.address
        }
      ],
      version: 1,
      timestamp: this.state.timestamp
    };

    return JSON.stringify(jsonMessage);
  }

  validateKeybaseUsername() {
    if (!this.state.keybaseUsername.match(/^[a-zA-Z0-9]*$/)) {
      return 'Invalid Username';
    }

    return '';
  }

  async sendVerificationToServer() {
    const request = this.getServerRequest();

    try {
      const response = await fetch(
        paths.verification.add,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        }
      );

      if (response.status !== 200) {
        throw Error("Request to server failed");
      }

      this.setState({ sendToServerState: 2 });
    } catch(e) {
      this.setState({ sendToServerState: 3 });
      console.error(e);
    }
  }

  // this is also displayed in the proof dialog
  getServerRequest() {
    return {
      version: 1,
      timestamp: this.state.timestamp,
      services: [
        {
          type: 'keybase',
          userID: this.state.keybaseUsername,
          proof: this.state.keybaseSignature
        },
        {
          type: 'ethereum_address',
          userID: this.props.address,
          proof: this.state.walletSignature
        }
      ]
    };
  }

  // ------ Presentational Functions ------

  getContent(formState) {
    switch (formState) {
      case FORM_STATES.OVERVIEW:
        return this.getOverviewContent();
      case FORM_STATES.FORM:
        return this.getFormContent();
      case FORM_STATES.CONFIRMATION:
        return this.getConfirmationContent();
      default:
        return null;
    }
  }

  getOverviewContent() {
    return (
      <div style={{ width: '100%' }}>
        <Row center='xs'>
          <div>
            <img src='/images/AddressLink.png' role='presentation' width={300} />
          </div>
        </Row>
        <Row style={{ fontSize: 20, textAlign: 'center' }} center='xs'>
          <Col xs={10}>
            {'Verify Address Ownership'}
          </Col>
        </Row>
        <Row
          style={{
            textAlign: 'left',
            marginTop: 18
          }}
          center='xs'
        >
          <Col xs={10}>
            <p>
              Publicly verify you are the owner of this address by linking it with
              a <a href='https://www.keybase.io' target='_blank'>Keybase</a> account
            </p>
          </Col>
        </Row>
        <Row
          style={{
            textAlign: 'left',
            lineSpacing: 1.3
          }}
          center='xs'
        >
          <Col xs={10}>
            <ul>
              <li style={{ marginBottom: 18 }} >
                Weipoint creates a message which you will cryptographically sign with both your
                Keybase account and your Ethereum wallet. This means anyone can provably verify
                your keybase account owns this address
              </li>
              <li style={{ marginBottom: 18 }} >
                Keybase accounts can be linked with Github, Facebook, Reddit and other common
                internet accounts. If you link internet accounts to your Keybase, your Ethereum
                address will be discoverable by your username on those sites.
              </li>
              <li>
                If you create any contracts using this address Weipoint will
                automatically display your Keybase account on those contracts,
                making it easy for users to trust their authenticity
              </li>
            </ul>
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

  getConfirmationContent() {
    const shortAddress = this.props.address.substring(0,10) + '...';
    const weipointKeybaseAddress = '/service/keybase/' + this.state.keybaseUsername;

    const extraLinks = this.state.keybaseUser.proofs_summary.all.filter(
      u => u.proof_type !== 'generic_web_site' && u.proof_type !== 'dns'
    ).map( u => {
      let type = u.proof_type;
      // Should be domain, but also doesn't work right now :(
      if (type === 'generic_web_site' || type === 'dns') {
        type = 'domain';
      }
      return '/service/' + u.proof_type + '/' + u.nametag;
    });

    const links = extraLinks.concat([weipointKeybaseAddress]);

    switch (this.state.sendToServerState) {
      case 0:
        console.error('Got to confirmation without sending to server');
        return null;
      case 1:
        return (
          <div style={{ marginTop: 150 }}>
            <Row center='xs'>
              {this.getVerifying()}
            </Row>
          </div>
        );
      case 2:
        return (
          <div style={{ width: '100%' }}>
            <Row center='xs' style={{ marginTop: 20, marginBottom: 35 }}>
              <div style={{ display: 'flex' }}>
                <div>
                  <KeybaseBadge username={this.state.keybaseUsername} />
                </div>
                <div
                  style={{ marginLeft: 6, marginRight: 6, marginTop: 'auto', marginBottom: 'auto' }}
                >
                  <SwapHoriz color='#4c4c4c'/>
                </div>
                <div>
                  <EthereumBadge address={shortAddress} />
                </div>
              </div>
            </Row>
            <Row style={{ fontSize: 20, textAlign: 'center' }} center='xs'>
              <Col xs={10}>
                {'Address Verified'}
              </Col>
            </Row>
            <Row
              style={{
                textAlign: 'left',
                marginTop: 18
              }}
              center='xs'
            >
              <Col xs={10} lg={9}>
                <p>
                  Congratulations, you have successfully verified your address!
                  You are now discoverable at:
                </p>
              </Col>
            </Row>
            <Row
              style={{
                textAlign: 'left',
              }}
              center='xs'
            >
              <Col xs={10} lg={9}>
                <ul>
                  {
                    links.map( l => <li key={l} style={{ marginTop: 5 }}>
                      <Link
                        to={l}
                        style={{ textDecoration: 'none' }}
                      >
                        {'www.weipoint.com' + l}
                      </Link>
                    </li>)
                  }
                </ul>
              </Col>
            </Row>
            <Row
              style={{
                textAlign: 'left'
              }}
              center='xs'
            >
              <Col xs={10} lg={9}>
                <p>
                  As well as by searching for your linked usernames through the main search
                  bar. If you create/have created any contracts with your address they will
                  also be discoverable by your username.
                </p>
              </Col>
            </Row>
            <Row center='xs'>
              <FlatButton
                label='view your proof'
                onClick={ () => this.setState({ showProof: true }) }
              />
            </Row>
          </div>
        );
      case 3:
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
                  <CancelIcon style={{ width: 60, height: 60 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {'Unable to save your verification. Click below to try again, or reload the form.'}
              </p>
            </Row>
            <Row center='xs'>
              <RaisedButton
                label='Retry'
                primary={true}
                onTouchTap={this.sendVerificationToServer}
              />
            </Row>
          </div>
        );
      default:
        return null;
    }

  }

  getFormContent() {
    // TODO make this look decent on small screens
    return (
      <div>
        <Row center='xs'>
          <div style={{ width: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            <Stepper
              linear={false}
              activeStep={this.state.stepIndex}
              style={{
                height: 60
              }}
            >
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
          </div>
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
          <div style={{ marginTop: 8, marginBottom: 8}}>
            <a
              href='https://keybase.io'
              target='_blank'
              style={{
                textDecoration: 'none'
              }}
            >
              <FlatButton
                label='keybase.io'
                labelPosition='after'
                icon={
                  <img
                    src='/images/keybaseLogo.png'
                    width={28}
                    height={28}
                    role='presentation'
                  />
                }
              />
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
            onKeyPress={ event => {
              if (event.charCode === 13) {
                event.preventDefault();
                if (this.validateKeybaseUsername() === '' && this.state.keybaseUsername !== '') {
                  this.verifyKeybaseUsername(this.state.keybaseUsername);
                }
              }
            }}
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
          <div>
            <Row center='xs'>
              <RaisedButton
                label='Next'
                primary={true}
                onTouchTap={ () => this.verifyKeybaseUsername(this.state.keybaseUsername) }
                disabled={this.state.keybaseUsername === '' || this.validateKeybaseUsername() !== ''}
              />
            </Row>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CancelIcon style={{ width: 60, height: 60 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {this.state.keybaseUsernameError}
              </p>
            </Row>
          </div>
        );
      case VERIFICATION_STATES.VERIFIED:
        return this.getVerified();
      case VERIFICATION_STATES.VERIFYING:
        return null;
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
          <p>
            The next step is to sign a message declaring you own this address
            with your Keybase account. Follow the steps below:
          </p>
        </Row>
        <Row center='xs' style={{ textAlign: 'left' }}>
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
            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <CopyButton
                label='Copy Message'
                copyValue={this.getMessageToSign()}
              />
            </div>
            <div
              style={{
                marginTop: 'auto',
                marginBottom: 'auto',
                marginRight: 12,
                marginLeft: 12,
                lineSpacing: 1,
                width: 24,
                height: 24
              }}
            >
              <Forward style={{ width: 24, heigh: 24 }}/>
            </div>
            <a
              href='https://keybase.io/sign'
              target='_blank'
              style={{
                marginTop: 'auto',
                marginBottom: 'auto',
                textDecoration: 'none'
              }}
            >
              <FlatButton
                label='keybase.io/sign'
                labelPosition='after'
                icon={
                  <img
                    src='/images/keybaseLogo.png'
                    width={28}
                    height={28}
                    role='presentation'
                  />
                }
              />
            </a>
          </div>
        </Row>
        <Row center='xs'>
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
        return null;
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
                  <CancelIcon style={{ width: 60, height: 60 }} color={red600} />
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
            Click the button below to sign with your wallet.
          </p>
        </Row>
        <Row center='xs' style={{ marginTop: 25 }}>
          <Col xs={10}>
            {this.getWalletVerificationResult()}
          </Col>
        </Row>
      </div>
    );
  }

  getWalletVerificationResult() {
    switch (this.state.walletVerificationState) {
      case VERIFICATION_STATES.NOT_VERIFYING:
        return (
          <div>
            <RaisedButton
              label='Sign with Wallet'
              primary={true}
              onTouchTap={this.requestWalletSignature}
            />
          </div>
        );
      case VERIFICATION_STATES.FAILED:
        return (
          <div>
            <div>
              <RaisedButton
                label='Sign with Wallet'
                primary={true}
                onTouchTap={this.requestWalletSignature}
              />
            </div>
            <Row center='xs'>
              <Col xs={4}>
                <div
                  style={{
                    marginTop: 10,
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}
                  >
                  <CancelIcon style={{ width: 60, height: 60 }} color={red600} />
                </div>
              </Col>
            </Row>
            <Row center='xs'>
              <p>
                {this.state.walletSignatureError || 'Signing failed. Please try again'}
              </p>
            </Row>
          </div>
        );
      case VERIFICATION_STATES.VERIFIED:
        return this.getVerified();
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
        <Dialog
          modal={false}
          open={this.state.showProof}
          onRequestClose={ () => this.setState({ showProof: false }) }
        >
          <JSONPretty id="verification-proof" json={this.getServerRequest()} />
        </Dialog>
      </div>
    );
  }
}

VerifyAddress.propTypes = {
  address: React.PropTypes.string.isRequired,
  web3: React.PropTypes.object.isRequired
};

export default VerifyAddress;
