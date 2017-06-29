import React from "react";
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import Edit from 'material-ui/svg-icons/image/edit';
import Close from 'material-ui/svg-icons/navigation/close';

const MAX_LENGTH = 100;

class EditableField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      error: '',
      editing: false,
      showReviewingMessage: false,
      showButton: false
    };

    this.getElements = this.getElements.bind(this);
    this.getAddElement = this.getAddElement.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onChange(event, newValue) {
    this.setState({
      value: newValue,
      error: this.props.validate(newValue.trim())
    });
  }

  onKeyPress(event) {
    if (event.charCode === 13) { // enter key pressed
      event.preventDefault();
      if (this.state.value.trim() === '') {
        return;
      }
      if (this.props.validate(this.state.value.trim()) === '') {
        const showMessage = !(this.props.autoAcceptFirst && !this.props.value);
        this.setState({ value: '', editing: false, showReviewingMessage: showMessage });
        this.props.add(this.state.value.trim());
      }
    }
  }

  getAddElement() {
    const size = 18;
    const iconStyle = {
      marginTop: 'auto',
      marginBottom: 'auto',
      width: size,
      height: size,
      marginLeft: 10,
      lineHeight: 0
    };
    if (this.state.editing) {
      return (
        <div key='addDescription' style={{ display: 'flex' }}>
          <div style={iconStyle}>
            <span
              className="hint--bottom-right hint--rounded"
              aria-label="Hide"
              style={{
                width: size,
                height: size,
                cursor: 'pointer'
              }}
              onClick={ e => this.setState({ editing: false })}
            >
              <Close color='#424242' style={{ width: size, height: size }} hoverColor='#000000' />
            </span>
          </div>

        </div>
      );
    } else {
      let hoverDescription = this.props.value ? "Edit" : "Add";
      if (this.props.editHoverDescription) {
        hoverDescription += ' ';
        hoverDescription += this.props.editHoverDescription;
      }
      return (
        <div style={iconStyle} key='addDescription'>
          <span
            className="hint--bottom-right hint--rounded"
            aria-label={hoverDescription}
            style={{
              width: size,
              height: size,
              cursor: 'pointer'
            }}
            onClick={ e => this.setState({
              editing: true,
              value: this.props.valueString || ''
            })}
          >
            <Edit
              color='#424242'
              style={{
                width: size,
                height: size,
              }}
              hoverColor='#000000'
            />
          </span>
        </div>
      );
    }
  }

  validate(description) {
    if (description.length > MAX_LENGTH) {
      return 'Too long';
    }
    return '';
  }

  getElements() {
    let elements = [];
    const description = this.props.value || this.props.defaultValue
    if (this.state.editing) {
      const hintText = this.props.value ? 'Edit' : 'Add';
      elements.push(
        <TextField
          hintText={hintText}
          onChange={this.onChange}
          value={this.state.value}
          style={{ width: 220 }}
          onKeyPress={this.onKeyPress}
          errorText={this.state.error}
          inputStyle={{ fontSize: 14 }}
          hintStyle={{ fontSize: 14 }}
          key='editField'
        />
      )
    } else {
      let style = this.props.valueStyle || { fontStyle: 'italic' };
      style.marginTop = 'auto';
      style.marginBottom = 'auto';
      elements.push(
        <div
          style={style}
          key='description'
        >
          {description}
        </div>
      );
    }
    if (this.props.showAdd && (!this.props.autohideButton || this.state.showButton)) {
      elements.push(this.getAddElement());
    }
    return elements;
  }

  render() {
    const elements = this.getElements();
    return (
      <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          height: 48,
          fontSize: 14
        }}
        onMouseEnter={ () => {
          if (this.props.autohideButton && !this.state.showButton) {
            this.setState({ showButton: true });
          }
        }}
        onMouseLeave={ () => {
          if (this.props.autohideButton && this.state.showButton) {
            this.setState({ showButton: false });
          }
        }}
      >
        {elements}
        <Snackbar
          open={this.state.showReviewingMessage}
          message={
            <div style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center'}}>
              {"Submitted your update for review"}
            </div>
          }
          autoHideDuration={3000}
          onRequestClose={ e => this.setState({ showReviewingMessage: false })}
        />
      </div>
    );
  }
}

EditableField.propTypes = {
  value: React.PropTypes.node,
  valueString: React.PropTypes.string,
  defaultValue: React.PropTypes.string.isRequired,
  autoAcceptFirst: React.PropTypes.bool.isRequired,
  add: React.PropTypes.func,
  showAdd: React.PropTypes.bool.isRequired,
  validate: React.PropTypes.func.isRequired,
  valueStyle: React.PropTypes.object,
  autohideButton: React.PropTypes.bool,
  editHoverDescription: React.PropTypes.string
};

export default EditableField;
