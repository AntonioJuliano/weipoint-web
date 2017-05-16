import React from "react";
import isEqual from 'lodash.isequal';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import { withRouter } from 'react-router-dom';
import mixpanel from '../lib/Mixpanel';
import paths from '../lib/ApiPaths';
import DomainInfo from './DomainInfo';

const SEARCH_STATES = {
  SEARCHING: 1,
  COMPLETED: 2,
  ERROR: 3
}

const initialState = {
  searchState: SEARCH_STATES.SEARCHING,
  result: null
};

class FetchContract extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.lookup = this.lookup.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);

    mixpanel.track(
      "Domain",
      {"domain": props.match.params.domain.toLowerCase()}
    );
    this.lookup(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      mixpanel.track(
        "Domain",
        {"domain": nextProps.match.params.domain.toLowerCase()}
      );
      this.setState(initialState);
      this.lookup(nextProps);
    }
  }

  async lookup(props) {
    const domain = props.match.params.domain.toLowerCase();
    const requestPath = paths.ens.get + `?domain=${domain}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        this.setState({ searchState: SEARCH_STATES.ERROR });
        return;
      }
      const json = await response.json();
      this.setState({
        result: json,
        searchState: SEARCH_STATES.COMPLETED
      });
    } catch (e) {
      this.setState({ searchState: SEARCH_STATES.ERROR });
    }
  }

  getBodyElement() {
    switch(this.state.searchState) {
      case SEARCH_STATES.SEARCHING:
        return <PendingSearch />;
      case SEARCH_STATES.ERROR:
        return <SearchError />;
      case SEARCH_STATES.COMPLETED:
        return <DomainInfo
            result={this.state.result}
            domain={this.props.match.params.domain.toLowerCase()}
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

FetchContract.propTypes = {}

export default withRouter(FetchContract);
