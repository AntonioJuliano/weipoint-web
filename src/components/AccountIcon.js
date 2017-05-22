import React from "react";
import Avatar from 'material-ui/Avatar';
import { Link } from 'react-router-dom';
import '../lib/blockies.min.js'; /*global blockies:true*/
import FloatingActionButton from 'material-ui/FloatingActionButton';

class AccountIcon extends React.Component {
  render() {
    if (!this.props.userAccount) {
      return null;
    }

    const blocky = blockies.create({seed: this.props.userAccount}).toDataURL();

    return (
      <div
        className='hint--bottom-left hint--rounded'
        aria-label='Your Account'
        style={{ cursor: 'pointer' }}
      >
        <Link to={'/address/' + this.props.userAccount}>
          <FloatingActionButton
            mini={true}
          >
            <Avatar
              src={blocky}
              size={40}
            />
          </FloatingActionButton>
        </Link>
      </div>
    );
  }
}

AccountIcon.propTypes = {
  userAccount: React.PropTypes.string
}

export default AccountIcon;
