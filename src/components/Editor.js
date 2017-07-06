import React from "react";
import AceEditor from 'react-ace';
import Measure from 'react-measure';
require('../lib/mode-solidity.js');

import 'brace/theme/tomorrow';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      set: 0
    }
  }
  render() {
    const width = this.state.width;
    const height = this.state.height;

    return (
      <Measure
        bounds={true}
        onResize={(contentRect) => {
          this.setState({
            height: contentRect.bounds.height,
            width: contentRect.bounds.width,
            set: this.state.set + 1
          });
        }}
      >
        { ({ measureRef, contentRect }) => {
          return (
            <div style={{ width:'100%', height: '100%', maxHeight: 'inherit' }} ref={measureRef} >
              {this.state.set >= 1 && <AceEditor
                width={width + 'px'}
                height={height + 'px'}
                mode={this.props.mode || 'javascript'}
                theme='tomorrow'
                showGutter={this.props.showGutter}
                readOnly={this.props.readOnly}
                name={this.props.name}
                value={this.props.value}
                onChange={this.props.onChange}
                editorProps={{$blockScrolling: true}}
                setOptions={{
                  hScrollBarAlwaysVisible: false,
                  vScrollBarAlwaysVisible: false
                }}
              />}
            </div>
          );
        }}
      </Measure>
    );
  }
}

Editor.propTypes = {
  readOnly: React.PropTypes.bool,
  name: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  mode: React.PropTypes.string,
  showGutter: React.PropTypes.bool
};

export default Editor;
