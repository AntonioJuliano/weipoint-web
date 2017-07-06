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

    this.search(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(initialState);
      this.search(nextProps);
    }
  }

  async search(props) {
    const type = props.match.params.type;
    const userID = props.match.params.userID;
    const requestPath = paths.verification.get + `?type=${type}&userID=${userID}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });

      if (response.status !== 200) {
        this.setState({ searchState: SEARCH_STATES.ERROR });
        return;
      }
      const json = await response.json();

      // TODO handle multiple matches. For now just take first
      if (json.length > 0) {
        this.setState({
          result: json[0],
          searchState: SEARCH_STATES.COMPLETED
        });
      } else {
        this.setState({
          searchState: SEARCH_STATES.NOT_FOUND
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ searchState: SEARCH_STATES.ERROR });
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
