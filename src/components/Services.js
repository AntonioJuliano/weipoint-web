import React from 'react';
import { withRouter } from 'react-router-dom';
import paths from '../lib/ApiPaths';
import NotFound from './NotFound';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import FetchAddress from './FetchAddress';
import isEqual from 'lodash.isequal';

const SEARCH_STATES = {
  SEARCHING: 1,
  NOT_FOUND: 2,
  COMPLETED: 3,
  ERROR: 4
}

const initialState = {
  searchState: SEARCH_STATES.SEARCHING,
  result: null
};

class Services extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.search(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(initialState);
      this.search(nextProps);
    }
  }

  async mapToKeybaseUser(props) {
    const type = props.match.params.type;
    const userID = props.match.params.userID;

    if (type === 'keybase') {
      return { type, userIDs: [userID] };
    }

    const keybasePath =
      `https://keybase.io/_/api/1.0/user/lookup.json?${type}=${userID}`;
    const keybaseResponse = await fetch(keybasePath, { method: 'get' });

    if (keybaseResponse.status >= 400 && keybaseResponse.status < 500) {
      return { type: null };
    }

    if (keybaseResponse.status !== 200) {
      throw new Error('Keybase bad response');
    }

    const keybaseJson = await keybaseResponse.json();

    if (keybaseJson.them.length === 0) {
      return { type: null };
    }

    return { type: 'keybase', userIDs: keybaseJson.them.map( u => u.basics.username) }
  }

  async search(props) {
    try {
      const { type, userIDs } = await this.mapToKeybaseUser(props);

      if (!type) {
        if (this.mounted) {
          this.setState({
            searchState: SEARCH_STATES.NOT_FOUND
          });
        }
        return;
      }

      const userIDsQuery = userIDs.map( id => '&userIDs=' + id).join('');

      const requestPath = paths.verification.get + `?type=${type}${userIDsQuery}`;
      const response = await fetch(requestPath, { method: 'get' });

      if (response.status !== 200) {
        if (this.mounted) {
          this.setState({ searchState: SEARCH_STATES.ERROR });
        }
        return;
      }
      const json = await response.json();

      // TODO handle multiple matches. For now just take first
      if (json.length > 0) {
        if (this.mounted) {
          this.setState({
            result: json[0],
            searchState: SEARCH_STATES.COMPLETED
          });
        }
      } else {
        if (this.mounted) {
          this.setState({
            searchState: SEARCH_STATES.NOT_FOUND
          });
        }
      }
    } catch (e) {
      console.error(e);
      if (this.mounted) {
        this.setState({ searchState: SEARCH_STATES.ERROR });
      }
    }
  }

  getBodyElement() {
    switch(this.state.searchState) {
      case SEARCH_STATES.SEARCHING:
        return <PendingSearch />;
      case SEARCH_STATES.NOT_FOUND:
        return <NotFound
            query={this.props.match.params.userID}
          />;
      case SEARCH_STATES.ERROR:
        return <SearchError />;
      case SEARCH_STATES.COMPLETED:
        const address =
          this.state.result.services.find( s => s.type === 'ethereum_address' ).userID;
        return <FetchAddress
            web3={this.props.web3}
            contractStore={this.props.contractStore}
            userAccount={this.props.userAccount}
            address={address}
          />;
      default:
        // Shouldn't get here
        return null;
    }
  }

  render() {
    return this.getBodyElement();
  }
}

Services.propTypes = {
  web3: React.PropTypes.object.isRequired,
  contractStore: React.PropTypes.object.isRequired,
  userAccount: React.PropTypes.string,
};

export default withRouter(Services);
