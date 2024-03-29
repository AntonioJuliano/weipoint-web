import React from 'react';
import Markdown from 'react-remarkable';

class MarkdownRenderer extends React.Component {
  render() {
    return (
      <div style={{ textAlign: 'left' }}>
        {
          this.props.title &&
          <h2>{this.props.title}</h2>
        }
        <Markdown source={this.props.content} style={this.props.mdStyle} />
      </div>
    );
  }
}

MarkdownRenderer.propTypes = {
  content: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
  mdStyle: React.PropTypes.object
}

export default MarkdownRenderer;
