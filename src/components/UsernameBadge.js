import React from 'react';

class UsernameBadge extends React.Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: this.props.backgroundColor,
          display: 'flex',
          height: 28,
          whiteSpace: 'nowrap',
          borderRadius: 28
        }}
      >
        <div>
          <img
            src={this.props.image}
            style={{
              width: 16,
              height: 16,
              marginLeft: 10,
              marginTop: 6,
              marginBottom: 6,
              marginRight: 8
            }}
            role='presentation'
          />
        </div>
        <div
          style={{
            marginTop: 'auto',
            marginBottom: 'auto',
            marginLeft: 0,
            marginRight: 14,
            color: this.props.textColor,
            fontSize: 13
          }}
        >
          {this.props.username}
        </div>
      </div>
    );
  }
}

UsernameBadge.propTypes = {
  username: React.PropTypes.string.isRequired,
  backgroundColor: React.PropTypes.string.isRequired,
  textColor: React.PropTypes.string.isRequired,
  image: React.PropTypes.string.isRequired,
}

export default UsernameBadge;
