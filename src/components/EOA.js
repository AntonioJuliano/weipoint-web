import React from "react";
import {Card, CardTitle} from 'material-ui/Card';
import { withRouter, Route, Switch } from 'react-router-dom';
import { Row, Col } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';
import TokenBalances from './TokenBalances';
import VerifyAddress from './VerifyAddress';
import Verifications from './Verifications';
import { Link } from 'react-router-dom';

const MIN_CONTENT_HEIGHT = 250;

/**
 * EOA - Externally owned account, e.g. a non-contract Ethereum account
 * @type {Object}
 */
class EOA extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };

    this.getBodyContent = this.getBodyContent.bind(this);
    this.getDefaultContent = this.getDefaultContent.bind(this);

    this.mounted = false;
  }

  updateDimensions() {
    if (this.mounted) {
      this.setState({ height: window.innerHeight - 287 });
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  getInfoElement(address) {
    return (
      <div>
        <div style={{ marginTop: 15 }}>
          {'View on '}
          <a
            href={'https://etherscan.io/address/' + address}
            target='_blank'
            style={{ textDecoration: 'none' }}
          >
            {'Etherscan'}
          </a>
        </div>
      </div>
    );
  }

  getBodyContent() {
    return (
      <div>
        <Switch>
          <Route
            path='*/verify'
            render={() => <VerifyAddress
              address={this.props.address}
              web3={this.props.web3}
              />
            }
          />
          <Route
            render={() => this.getDefaultContent()}
          />
        </Switch>
      </div>
    );
  }

  getDefaultContent() {
    const headerStyle = {
      marginTop: 10,
      fontSize: 18,
      color: '#616161',
      marginBottom: 10,
      marginLeft: -10
    };
    const isUserAccount = this.props.address === this.props.userAccount;

    return (
      <div>
        <Row style={{ marginTop: 10, marginBottom: 20 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div>
              <div style={headerStyle}>
                {'Verified Identities'}
              </div>
              <div style={{ marginTop: 15, marginLeft: 12 }}>
                <Verifications
                  type='ethereum_address'
                  userID={this.props.address}
                  showLoader={true}
                  noVerificationsElement={
                    <div style={{ fontSize: 12 }}>
                      {'This address has no verified identities. If you own this address '}
                      <Link
                        to={this.props.location.pathname + '/verify'}
                        style={{ textDecoration: 'none' }}
                      >
                        click here
                      </Link>
                      {' to link it to a Keybase account.'}
                    </div>
                  }
                />
              </div>
            </div>
          </Col>
        </Row>
        <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
        <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div>
              <div style={headerStyle}>
                {'Balances'}
              </div>
              <div style={{ marginTop: 15 }}>
                <TokenBalances
                  address={this.props.address}
                  web3={this.props.web3}
                  isUserAccount={isUserAccount}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
        <Row style={{ marginTop: 10, marginBottom: 20 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div>
              <div style={headerStyle}>
                {'Info'}
              </div>
              <div style={{ marginTop: 15, marginLeft: 12 }}>
                {this.getInfoElement(this.props.address)}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const isUserAccount = this.props.address === this.props.userAccount;

    return (
      <div
        style={{ marginTop: 15, textAlign: 'left', marginBottom: 10 }}
      >
        <Card>
          <div style={{ display: 'flex', maxWidth: 'inherit', width: 'inherit' }} >
            <CardTitle
              title={this.props.address}
              subtitle={isUserAccount ? 'Your Account' : 'Non-contract account'}
              titleStyle={{ overflowX: 'auto' }}
              subtitleStyle={{ wordWrap: 'break-word', marginTop: 4 }}
              style={{ maxWidth: '90%' }}
            />
          </div>
          <div style={{
            // height: this.state.height,
            minHeight: Math.max(MIN_CONTENT_HEIGHT, this.state.height),
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {this.getBodyContent()}
          </div>
        </Card>
      </div>
    );
  }
}

EOA.propTypes = {
  address: React.PropTypes.string.isRequired,
  userAccount: React.PropTypes.string,
  web3: React.PropTypes.object.isRequired
};

export default withRouter(EOA);
