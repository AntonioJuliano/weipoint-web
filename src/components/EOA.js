import React from "react";
import {Card, CardTitle} from 'material-ui/Card';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';

const MIN_CONTENT_HEIGHT = 250;

class EOA extends React.Component {
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

  render() {
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
              title={this.props.address}
              subtitle={'Non-contract account'}
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
            <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
            <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
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
        </Card>
      </div>
    );
  }
}

EOA.propTypes = {
  address: React.PropTypes.string.isRequired,
};

export default withRouter(EOA);
