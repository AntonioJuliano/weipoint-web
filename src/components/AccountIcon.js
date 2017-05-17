import React from "react";
import Avatar from 'material-ui/Avatar';
import { Link } from 'react-router-dom';
import '../lib/blockies.min.js'; /*global blockies:true*/

class AccountIcon extends React.Component {
  render() {
    if (!this.props.userAddress) {
      return null;
    }

    const blocky = blockies.create({seed: this.props.userAddress}).toDataURL();

    return (
      <div
        className='hint--bottom-left hint--rounded'
        aria-label='Your Account'
        style={{ cursor: 'pointer' }}
      >
        <Link to={'/address/' + this.props.userAddress}>
          <Avatar
            src={blocky}
            size={37}
          />
        </Link>
      </div>
    );
  }
}

AccountIcon.propTypes = {
  userAddress: React.PropTypes.string
}

export default AccountIcon;
