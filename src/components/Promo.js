import React from 'react';
import { Link } from 'react-router-dom';
import { Row } from 'react-flexbox-grid';

class Promo extends React.Component {
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Link to={this.props.link} style={{ textDecoration: 'none', color: '#000000' }}>
          <img src={this.props.image} role='presentation' style={{ maxWidth: '100%' }}/>
          <Row center='xs'>
              {this.props.message}
          </Row>
        </Link>
      </div>
    );
  }
}

Promo.propTypes = {
  image: React.PropTypes.string,
  message: React.PropTypes.string,
  link: React.PropTypes.string,
  post: React.PropTypes.string,
};

export default Promo;
