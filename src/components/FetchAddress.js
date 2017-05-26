import React from "react";
import isEqual from 'lodash.isequal';
import EOA from './EOA';
import PendingSearch from './PendingSearch';
import NotFound from './NotFound';
import SearchError from './SearchError';
import Contract from './Contract';
import { withRouter } from 'react-router-dom';
import mixpanel from '../lib/Mixpanel';
import paths from '../lib/ApiPaths';

const SEARCH_STATES = {
  SEARCHING: 1,
  CONTRACT: 2,
  EOA: 3, // Externally owned account, e.g. a non-contract account
  ERROR: 4,
  INVALID: 5
}

const initialState = {
  searchState: SEARCH_STATES.SEARCHING,
  contract: null
};

class FetchAddress extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.search = this.search.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);

    mixpanel.track(
      "Contract", // Contract for legacy reasons
      {"address": this.getAddress(props)}
    );
    if (props.contractStore[this.getAddress(props)]) {
      this.state = {
        contract: props.contractStore[this.getAddress(props)],
        searchState: SEARCH_STATES.CONTRACT
      };
    } else {
      if (!props.web3.isAddress(this.getAddress(props))) {
        this.state = {
          searchState: SEARCH_STATES.INVALID,
          contract: null
        };
      } else {
        this.search(props);
      }
    }
  }

  getAddress(props) {
    const address = props.address || props.match.params.address;
    if (address) {
      return address.toLowerCase();
    } else {
      return address;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.getAddress(nextProps), this.getAddress(this.props))) {
      mixpanel.track(
        "Contract",
        {"address": this.getAddress(nextProps)}
      );
      if (nextProps.contractStore[this.getAddress(nextProps)]) {
        this.setState({
          contract: nextProps.contractStore[this.getAddress(nextProps)],
          searchState: SEARCH_STATES.CONTRACT
        });
      } else {
        if (!nextProps.web3.isAddress(this.getAddress(nextProps))) {
          this.setState({
            searchState: SEARCH_STATES.INVALID,
            contract: null
          });
        } else {
          this.setState(initialState);
          this.search(nextProps);
        }
      }
    }
  }

  async search(props) {
    const address = this.getAddress(props);
    const requestPath = paths.contract.get + `?address=${address}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status === 400) {
        this.setState({ searchState: SEARCH_STATES.EOA });
        return;
      }
      if (response.status !== 200) {
        this.setState({ searchState: SEARCH_STATES.ERROR });
        return;
      }
      const json = await response.json();
      this.props.contractStore[address] = json.contract;
      this.setState({
        contract: json.contract,
        searchState: SEARCH_STATES.CONTRACT
      });
    } catch (e) {
      this.setState({ searchState: SEARCH_STATES.ERROR });
    }
  }

  getBodyElement() {
    switch(this.state.searchState) {
      case SEARCH_STATES.SEARCHING:
        return <PendingSearch />;
      case SEARCH_STATES.EOA:
        return <EOA
            address={this.getAddress(this.props)}
            userAccount={this.props.userAccount}
            web3={this.props.web3}
          />;
      case SEARCH_STATES.ERROR:
        return <SearchError />;
      case SEARCH_STATES.INVALID:
        return <NotFound query={this.getAddress(this.props)} />;
      case SEARCH_STATES.CONTRACT:
        return <Contract
            contract={this.state.contract}
            web3={this.props.web3}
            contractStore={this.props.contractStore}
          />
      default:
        // Shouldn't get here
        return null;
    }
  }

  render() {
    return this.getBodyElement();
  }
}

FetchAddress.propTypes = {
  web3: React.PropTypes.object.isRequired,
  contractStore: React.PropTypes.object.isRequired,
  userAccount: React.PropTypes.string,
  address: React.PropTypes.string
};

export default withRouter(FetchAddress);
