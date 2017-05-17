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

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchStore: {},
      contractStore: {},
      autocompleteStore: {},
      userAccount: null
    };
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
    this.getUserAccount = this.getUserAccount.bind(this);

    this.getUserAccount();
  }

  handleSearchBarClick(query) {
    if (query === '') {
      return;
    }

    if (this.props.web3.isAddress(query)) {
      this.props.history.push('/address/' + query);
    } else if (this.isEnsDomain(query)) {
      this.props.history.push('/domain/' + query);
    } else {
      this.props.history.push('/search/' + query);
    }
  }

  isEnsDomain(query) {
    return query.match(/^[a-zA-z0-9]+(\.?[a-zA-z0-9]+)+\.eth$/);
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

  async getUserAccount() {
    if (!this.props.web3.isConnected()) {
      return;
    }
    const userAccounts = await this.props.web3.eth.getAccountsAsync();

    if (userAccounts) {
      this.setState({ userAccount: userAccounts[0] });
    }
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

export default withRouter(Search);
