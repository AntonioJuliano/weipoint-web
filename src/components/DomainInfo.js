import React from "react";
import {Card, CardTitle} from 'material-ui/Card';
import { withRouter, Link } from 'react-router-dom';
import { Row, Col } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';

const MIN_CONTENT_HEIGHT = 280;

class DomainInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };
  }

  updateDimensions() {
    this.setState({ height: window.innerHeight - 287 });
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  getDomainStatusElement(entry) {
    switch (entry.status) {
      case 0: // Open
        return (
          <div>
            {'Unowned - Available'}
          </div>
        );
      case 1: // Auction
        return (
          <div>
            {'Unowned - Available (auction started)'}
          </div>
        );
      case 2: // Owned
        return (
          <div>
            {'Owned by '}
            <Link to={'/address/' + entry.deed.owner} style={{ textDecoration: 'none' }}>
              {entry.deed.owner}
            </Link>
          </div>
        );
      case 3: // Forbidden
        return (
          <div>
            {'Unowned - Not for auction'}
          </div>
        );
      case 4: // Reveal
        return (
          <div>
            {'Unowned - Unavailable (auction closed)'}
          </div>
        );
      case 5: // Not Yet Available
        return (
          <div>
            {'Unowned - Not up for auction yet'}
          </div>
        );
      default:
        return null;
    }
  }

  getInfoElement(domain) {
    const splitDomain = domain.split('.');
    const baseDomain = splitDomain[splitDomain.length - 2];
    return (
      <div>
        <div style={{ marginBottom: 15 }}>
          {'View ' + domain + ' on '}
          <a
            href={'https://registrar.ens.domains/#' + baseDomain}
            target='_blank'
            style={{ textDecoration: 'none' }}
          >
            {'ENS dApp'}
          </a>
        </div>
        <div style={{ marginTop: 15 }}>
          {'Detailed info at '}
          <a
            href={'https://etherscan.io/enslookup?q=' + baseDomain + '.eth'}
            target='_blank'
            style={{ textDecoration: 'none' }}
          >
            {'Etherscan'}
          </a>
        </div>
      </div>
    );
  }

  render() {
    const address = this.props.result.address;

    const linkedDomain = address ?
      <Link to={'/address/' + address} style={{ textDecoration: 'none'}}> {this.props.domain} </Link>
      : this.props.domain;

    const headerStyle = {
      marginTop: 10,
      fontSize: 18,
      color: '#616161',
      marginBottom: 10,
      marginLeft: -10
    };

    return (
      <div
        style={{ marginTop: 15, textAlign: 'left', marginBottom: 10 }}
      >
        <Card>
          <div style={{ display: 'flex', maxWidth: 'inherit', width: 'inherit' }} >
            <CardTitle
              title={linkedDomain}
              subtitle={address || 'Domain not yet setup'}
              titleStyle={{ wordWrap: 'break-word' }}
              subtitleStyle={{ wordWrap: 'break-word', marginTop: 4 }}
              style={{ maxWidth: '90%' }}
            />
          </div>
          <div style={{
            height: this.state.height,
            minHeight: MIN_CONTENT_HEIGHT,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <Row style={{ marginBottom: 10 }} center='xs'>
              <Col xs={10} style={{ textAlign: 'left' }}>
                <div>
                  <div style={headerStyle}>
                    {'Domain Status'}
                  </div>
                  <div style={{ marginTop: 15, marginLeft: 12, marginBottom: 15 }}>
                    {this.getDomainStatusElement(this.props.result.entry)}
                  </div>
                </div>
              </Col>
            </Row>
            <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
            <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
              <Col xs={10} style={{ textAlign: 'left' }}>
                <div>
                  <div style={headerStyle}>
                    {'Info'}
                  </div>
                  <div style={{ marginTop: 15, marginLeft: 12 }}>
                    {this.getInfoElement(this.props.domain)}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    );
  }
}

DomainInfo.propTypes = {
  result: React.PropTypes.object.isRequired,
  domain: React.PropTypes.string.isRequired,
};

export default withRouter(DomainInfo);
