import React from 'react';
import Paper from 'material-ui/Paper';

class PromoViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPromo: props.promos[0],
      currentIndex: 0
    };

    this.nextPromo = this.nextPromo.bind(this);

    setTimeout(this.nextPromo, this.props.switchDelay);
  }

  nextPromo() {
    let nextIndex = this.state.currentIndex + 1
    if (nextIndex >= this.props.promos.length) {
      nextIndex = 0;
    }

    this.setState({
      currentPromo: this.props.promos[nextIndex],
      currentIndex: nextIndex
    });

    setTimeout(this.nextPromo, this.props.switchDelay);
  }

  render() {
    return (
      <div style={{ width: 300, height: 200 }}>
        <Paper style={{ width: '100%', height: '100%' }} zDepth={1}>
          <div style={{ width: '80%', height: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            {this.state.currentPromo}
          </div>
          <div style={{ width: '100%', height: 20 }}>
            content
          </div>
        </Paper>

      </div>
    );
  }
}

PromoViewer.propTypes = {
  promos: React.PropTypes.array.isRequired,
  switchDelay: React.PropTypes.number.isRequired
};

export default PromoViewer;
