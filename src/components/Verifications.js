import React from 'react';
import { withRouter } from 'react-router-dom';
import paths from '../lib/ApiPaths';
import isEqual from 'lodash.isequal';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import KeybaseBadge from './KeybaseBadge';

const REQUEST_STATES = {
  INITIAL: 0,
  COMPLETED: 1
};

const initialState = {
  requestState: REQUEST_STATES.INITIAL,
  verifications: null
};

class Verifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.fetch = this.fetch.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
    this.getBadgeElements = this.getBadgeElements.bind(this);
    this.getServices = this.getServices.bind(this);

    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(initialState);
      console.log('receive props')
      this.fetch(nextProps);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.fetch(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async fetch(props) {
    const type = props.match.params.type;
    const userID = props.match.params.userID;
    const requestPath = paths.verification.get + `?type=${type}&userID=${userID}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });

      if (response.status !== 200) {
        return;
      }
      const json = await response.json();

      if (!this.mounted) {
        return;
      }

      this.setState({
        requestState: REQUEST_STATES.COMPLETED,
        verifications: json
      });
    } catch (e) {
      console.error(e);
    }
  }

  getBodyElement() {
    switch (this.state.requestState) {
      case REQUEST_STATES.INITIAL:
        if (this.props.showLoader) {
          return (
            <div style={{ width: '100%' }}>
              <RefreshIndicator
                size={50}
                left={0}
                top={0}
                loadingColor="#9b59b6"
                status="loading"
                style={{
                  position: 'relative',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 50
                }}
              />
            </div>
          );
        }
        return null;
      case REQUEST_STATES.COMPLETED:
        return this.getBadgeElements(this.state.verifications);
      default:
        console.error('Invalid requestState ' + this.state.requestState);
        return null;
    }
  }

  getBadgeElements(verifications) {
    if (verifications.length === 0) {
      return this.props.noVerificationsElement;
    }

    const services = this.getServices(verifications);

    return (
      <div style={{ display: 'flex' }}>
        {
          services.map( s => {
            switch (s.type) {
              case 'keybase':
                return <KeybaseBadge
                  username={s.userID}
                  link={true}
                  key={'keybase-' + s.userID}
                />
              default:
                console.error('unknown service type: ' + s.type);
                return null;
            }
          })
        }
      </div>
    );
  }

  getServices(verifications) {
    const services =  verifications.map(
      v => v.services.find( s => s.type !== this.props.type )
    ).map( s => { return { type: s.type, userID: s.userID } });

    return services.filter( (i, idx, arr) => arr.indexOf(i) === idx); // Removes duplicates
  }

  render() {
    return this.getBodyElement();
  }
}

Verifications.propTypes = {
  type: React.PropTypes.string.isRequired,
  userID: React.PropTypes.string.isRequired,
  showLoader: React.PropTypes.bool,
  noVerificationsElement: React.PropTypes.node
};

export default withRouter(Verifications);
