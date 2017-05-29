import React from "react";
import SearchBar from './SearchBar';
import FetchAddress from './FetchAddress';
import FetchDomain from './FetchDomain';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Route, withRouter, Switch } from 'react-router-dom';
import TagSearch from './TagSearch';
import PageNotFound from './PageNotFound';
import MarkdownRenderer from './MarkdownRenderer';
import terms from '../assets/docs/terms';
import privacy from '../assets/docs/privacy';
import About from './About';
import Wallet from './Wallet';
import { isEnsDomain } from '../lib/services/ensService';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchStore: {},
      contractStore: {},
      autocompleteStore: {},
      userAccount: this.getUserAccount(props.web3)
    };
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
    this.getUserAccount = this.getUserAccount.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ userAccount: this.getUserAccount(nextProps.web3) });
  }

  handleSearchBarClick(query) {
    if (query === '') {
      return;
    }

    if (this.props.web3.isAddress(query)) {
      this.props.history.push('/address/' + query);
    } else if (isEnsDomain(query)) {
      this.props.history.push('/domain/' + query);
    } else {
      this.props.history.push('/search/' + query);
    }
  }

  getBodyElement() {
    const content = (
      <div>
        <Switch>
          <Route
            path='/all/:page?'
            render={() => <TagSearch
              all={true}
              searchStore={this.state.searchStore}
              contractStore={this.state.contractStore}
            />}
          />
          <Route
            path='/search/:query/:page?'
            render={() => <TagSearch
              searchStore={this.state.searchStore}
              contractStore={this.state.contractStore}
            />}
          />
          <Route
            path="/address/:address"
            render={() => <FetchAddress
              web3={this.props.web3}
              contractStore={this.state.contractStore}
              userAccount={this.state.userAccount}
            />}
          />
          <Route
            path="/domain/:domain"
            render={() => <FetchDomain />}
          />
          <Route
            path='/wallet'
            render={() => <Wallet
              isLoaded={this.props.isLoaded}
              userAddress={this.state.userAccount}
              contractStore={this.state.contractStore}
              web3={this.props.web3}
            />}
          />
          <Route
            path="/terms"
            render={() => <MarkdownRenderer
              content={terms}
              title='Terms of Service'
            />}
          />
          <Route
            path="/privacy"
            render={() => <MarkdownRenderer
              content={privacy}
              title='Privacy Policy'
            />}
          />
          <Route
            path="/about"
            render={() => <About />}
          />
          <Route path="/:path" render={() => <PageNotFound />}/>
        </Switch>
      </div>
    );

    return (
      <Row center='xs'>
        <Col lg={8} md={9} sm={10} xs={12}>
          <div className="content">
            {content}
          </div>
        </Col>
      </Row>
    );
  }

  getUserAccount(web3) {
    if (!web3.isConnected()) {
      return 'none';
    }

    const thisRef = this;
    web3.eth.getAccountsAsync().then( userAccounts => {
      if (userAccounts) {
        thisRef.setState({ userAccount: userAccounts[0] });
      } else {
        thisRef.setState({ userAccount: 'none' });
      }
    }).catch( e => console.error(e) );

    return 'loading';
  }

  render() {
    return (
      <div className="search" style={{ minWidth: 320 }}>
        <Grid fluid={true}>
          <Row center='xs'>
            <div style={{ width: '100%'}}>
              <SearchBar
                onSearchClicked={this.handleSearchBarClick}
                onBrowseClicked={ () => this.props.history.push('/all') }
                reduced={this.props.location.pathname !== '/'}
                autocompleteStore={this.state.autocompleteStore}
                userAccount={this.state.userAccount}
              />
            </div>
          </Row>
          {this.getBodyElement()}
        </Grid>
      </div>
    );
  }
}

Search.propTypes = {
  web3: React.PropTypes.object.isRequired,
  isLoaded: React.PropTypes.bool
};

export default withRouter(Search);
