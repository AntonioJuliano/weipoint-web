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
import { verifySignature } from '../helpers/Keybase';
import CircularProgress from 'material-ui/CircularProgress';
import CheckCircleIcon from 'react-material-icons/icons/action/check-circle';
import CancelIcon from 'react-material-icons/icons/navigation/cancel';
import { green500, red600 } from 'material-ui/styles/colors';
import bluebird from 'bluebird';
import ethUtil from 'ethereumjs-util';

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
      stepIndex: 0,
      visited: [],
      keybaseUsername: '',
      keybaseSignature: '',
      keybaseSignatureError: '',
      keybaseVerificationState: VERIFICATION_STATES.NOT_VERIFYING,
    };

    this.verifyKeybaseSignature = this.verifyKeybaseSignature.bind(this);
    this.getStepContent = this.getStepContent.bind(this);
    this.getKeybaseVerificationResult = this.getKeybaseVerificationResult.bind(this);
    this.getMessageToSign = this.getMessageToSign.bind(this);
    this.requestWalletSignature = this.requestWalletSignature.bind(this);
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

      }
      const signature = result.result;
    } catch(e) {
      console.error(e);
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
                disabled={this.state.keybaseUsername.trim() === ''}
              >
                <StepButton onClick={() => this.setState({stepIndex: 1})}>
                  Keybase Signature
                </StepButton>
              </Step>
              <Step
                completed={this.state.visited.indexOf(2) !== -1 && this.state.stepIndex !== 2}
                active={this.state.stepIndex === 2}
                disabled={this.state.keybaseVerificationState !== VERIFICATION_STATES.VERIFIED}
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
        return (
          <div>
            <Row center='xs'>
              <TextField
                floatingLabelText='Keybase Username'
                value={this.state.keybaseUsername}
                onChange={ (e, v) => this.setState({ keybaseUsername: v }) }
              />
            </Row>
          </div>
        );
      case 1:
        return (
          <div>
            <Row center='xs'>
              <Col xs={10}>
                <p>
                  {this.getMessageToSign()}
                </p>
              </Col>
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
      case 2:
        return (
          <div>
            <Row center='xs'>
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
      default:
        return null;
    }
  }

  getKeybaseVerificationResult() {
    switch (this.state.keybaseVerificationState) {
      case VERIFICATION_STATES.NOT_VERIFYING:
        return null;
      case VERIFICATION_STATES.VERIFYING:
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

  render() {
    return (
      <div>
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
