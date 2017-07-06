import React from "react";
import CopyToClipboard from 'react-copy-to-clipboard';
import FlatButton from 'material-ui/FlatButton';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';

class CopyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bytecodeButtonText: this.props.label
    }
    this.copyBytecodeClicked = this.copyBytecodeClicked.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ bytecodeButtonText: nextProps.label });
  }

  copyBytecodeClicked(e) {
    this.setState({ bytecodeButtonText: 'Copied!' });
    const thisRef = this;
    setTimeout(function() {
      thisRef.setState({ bytecodeButtonText: thisRef.props.label });
    }, 1000);
  }

  render() {
    return (<CopyToClipboard text={this.props.copyValue}>
        <FlatButton
          label={this.state.bytecodeButtonText}
          onClick={this.copyBytecodeClicked}
          labelPosition='after'
          icon={<ContentCopy />}
        />
      </CopyToClipboard>
    );
  }
}

CopyButton.propTypes = {
  label: React.PropTypes.string.isRequired,
  copyValue: React.PropTypes.string.isRequired
};

export default CopyButton;
