import React from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';
import Ionicon from 'react-ionicons';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      hovered: null
    }
  }

  render() {
    let linkStyles = [{
      textDecoration: 'none',
      color: '#4c4c4c'
    }, {
      textDecoration: 'none',
      color: '#4c4c4c'
    }, {
      textDecoration: 'none',
      color: '#4c4c4c'
    }];

    if (this.state.hovered !== null && this.state.hovered < 3) {
      linkStyles[this.state.hovered].color = '#000000';
    }

    return (
      <footer
        style={{
          paddingBottom: 16,
          textAlign: 'center',
          fontSize: 14,
          paddingTop: 16,
        }}>
        <Col xs={10} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: 320 }}>
          <Divider style={{ margin: 'auto', width: '100%' }} />
          <div style={{ width: '100%', display: 'flex', marginTop: 16, marginRight: 0, justifyContent: 'flex-end' }}>
            <div style={{ width: 'auto', margin: 'auto', marginRight: 0, marginLeft: 0 }}>
              <a
                href='https://medium.com/weipoint'
                style={linkStyles[0]}
                onMouseEnter={ () => this.setState({ hovered: 0 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
                target='_blank'
              >
                {'Blog'}
              </a>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginRight: 0, marginLeft: 20 }}>
              <Link
                to='/about'
                style={linkStyles[0]}
                onMouseEnter={ () => this.setState({ hovered: 0 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'About'}
              </Link>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginLeft: 20, marginRight: 20 }}>
              <Link
                to='/privacy'
                style={linkStyles[1]}
                onMouseEnter={ () => this.setState({ hovered: 1 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'Privacy Policy'}
              </Link>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginLeft: 0, marginRight: 20 }}>
              <Link
                to='/terms'
                style={linkStyles[2]}
                onMouseEnter={ () => this.setState({ hovered: 2 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'Terms of Service'}
              </Link>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginRight: 5, marginLeft: 0, marginTop: 4 }}>
              <a
                href='https://twitter.com/weipointproject'
                style={linkStyles[0]}
                onMouseEnter={ () => this.setState({ hovered: 3 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
                target='_blank'
              >
                <Ionicon
                  icon="ion-social-twitter"
                  fontSize="20px"
                  color={ this.state.hovered === 3 ? '#000000' : "#4c4c4c"}
                />
              </a>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginRight: 0, marginLeft: 0, marginTop: 4 }}>
              <a
                href='https://www.facebook.com/weipoint'
                style={linkStyles[0]}
                onMouseEnter={ () => this.setState({ hovered: 4 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
                target='_blank'
              >
                <Ionicon
                  icon="ion-social-facebook"
                  fontSize="20px"
                  color={ this.state.hovered === 4 ? '#000000' : "#4c4c4c"}
                />
              </a>
            </div>
          </div>
        </Col>
      </footer>
    );
  }
}

export default Footer;
