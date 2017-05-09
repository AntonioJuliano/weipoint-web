import React from "react";
import Editor from './Editor';

class ViewSource extends React.Component {
  render() {
    return (
      <div style={{
          height: '100%'
        }}>
        <Editor
          readOnly={true}
          name='viewSource'
          value={this.props.source}
        />
      </div>
    );
  }
}

export default ViewSource;
