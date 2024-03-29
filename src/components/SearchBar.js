import React from "react";
import SearchIcon from 'react-material-icons/icons/action/search';
import WhatshotIcon from 'react-material-icons/icons/social/whatshot';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { Row, Col } from 'react-flexbox-grid';
import Autosuggest from 'react-autosuggest';
import { withRouter, Link } from 'react-router-dom';
import paths from '../lib/ApiPaths';
import AccountIcon from './AccountIcon';
import HelpButton from './HelpButton';

const SMALL_SCREEN_WIDTH = 676;

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      value: '',
      autocompleteSuggestions: [],
      smallScreen: window.innerWidth < SMALL_SCREEN_WIDTH
    };

    this.onChange = this.onChange.bind(this);
    this.getAutocompleteSuggestions = this.getAutocompleteSuggestions.bind(this);
    this.getInputElement = this.getInputElement.bind(this);
    this.search = this.search.bind(this);
  }

  updateDimensions() {
    if (!this.state.smallScreen && window.innerWidth < SMALL_SCREEN_WIDTH) {
      this.setState({ smallScreen: true });
    } else if (this.state.smallScreen && window.innerWidth >= SMALL_SCREEN_WIDTH) {
      this.setState({ smallScreen: false });
    }
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  search(value) {
    let query;
    if (value !== undefined) {
      query = value
    } else {
      query = this.state.value.trim().toLowerCase();
    }
    this.props.onSearchClicked(query);
  }

  onChange(event, { newValue, method }) {
    this.setState({ value: newValue });
  }

  async getAutocompleteSuggestions(v) {
    const value = v.value.trim().toLowerCase();

    // Use the cached value if available
    if (this.props.autocompleteStore[value]) {
      this.setState({ autocompleteSuggestions: this.props.autocompleteStore[value] });
      return;
    }

    const requestPath = paths.search.autocomplete + `?query=${value}`;

    try {
      const response = await fetch(requestPath);
      if (response.status !== 200) {
        throw new Error('Autocomplete fetch failed');
      }
      const json = await response.json();
      this.props.autocompleteStore[value] = json.results.map( r => r.value );
      if (this.state.value.trim().toLowerCase() === value) {
        this.setState({ autocompleteSuggestions: json.results.map( r => r.value )});
      }
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    let barSize = this.props.reduced ? (this.state.smallScreen ? 9 : 7) : 8;

    let barStyle = this.props.reduced ? { marginTop: 20 } : { marginTop: 190 };

    if (!this.props.reduced && this.state.smallScreen) {
      barStyle.marginTop = 150;
    }

    let colStyle = { height: 48 }

    if (!this.props.reduced) {
      colStyle.maxWidth = 550;
    } else {
      colStyle.maxWidth = 450;
      colStyle.marginTop = 'auto';
      colStyle.marginBottom = 'auto';
    }

    return (
      <div className='SearchBarContainer' style={barStyle}>
        <div
          style={{
            top: this.state.smallScreen ? 10 : 25,
            position: 'absolute', right: this.state.smallScreen ? 10 : 25,
            display: 'flex'
          }}
        >
          <div style={{ marginRight: 15 }}>
            <HelpButton smallScreen={this.state.smallScreen} />
          </div>
          <AccountIcon userAccount={this.props.userAccount}/>
        </div>
        {
          !this.props.reduced &&
          <div>
            <h1 style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 52,
              fontFamily: "Raleway, sans-serif",
              marginBottom: 12,
              fontWeight: 'normal'
            }}>
              {'Weipoint'}
            </h1>
            <h2 style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 18,
              fontFamily: "Raleway, sans-serif",
              marginBottom: 22,
              fontWeight: 'normal'
            }}>
              {'Search the decentralized web'}
            </h2>
          </div>
        }
        {
          this.props.reduced &&
          this.state.smallScreen &&
          <Link
            to='/'
            style={{
              textDecoration: 'none',
              marginTop: 'auto',
              marginBottom: 'auto',
              color: 'inherit'
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontFamily: "Raleway, sans-serif",
                marginLeft: 'auto',
                marginRight: 'auto',
                cursor: 'pointer',
                marginBottom: 20,
                fontWeight: 'normal'
              }}
            >
              {'Weipoint'}
            </h1>
          </Link>
        }
        <div className="SearchTextField" style={{ marginBottom: 20 }}>
          <Row
            center={(this.props.reduced && !this.state.smallScreen) ? null : 'xs'}
            style={{ display: 'flex' }}
          >
            {
              this.props.reduced &&
              !this.state.smallScreen &&
              <Link
                to='/'
                style={{
                  textDecoration: 'none',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  color: 'inherit'
                }}
              >
                <Col
                  smOffset={1}
                >
                  <h1
                    style={{
                      fontSize: 22,
                      fontFamily: "Raleway, sans-serif",
                      marginRight: 12,
                      cursor: 'pointer',
                      fontWeight: 'normal'
                    }}
                  >
                    {'Weipoint'}
                  </h1>
                </Col>
              </Link>
            }
            <Col
              xs={barSize}
              sm={barSize - 1}
              md={barSize - 1}
              lg={barSize - 1}
              style={colStyle}
            >
              <Paper zDepth={this.state.focused ? 2 : 1}
                onMouseEnter={ e => this.setState({ focused: true })}
                onMouseLeave={ e => this.setState({ focused: false })}>
                {this.getInputElement()}
              </Paper>
            </Col>
            {
              this.props.reduced &&
              <div style={{ marginTop: 4, marginBottom: 4, marginLeft: 8 }}>
                <FloatingActionButton
                  mini={true}
                  onClick={() => this.search()}
                  >
                  <SearchIcon />
                </FloatingActionButton>
              </div>
            }
          </Row>
        </div>
        {
          !this.props.reduced &&
          <div style={{ display: 'flex', marginLeft: 'auto', marginRight: 'auto' }} className='button_container_2'>
            <div  style={{ marginLeft: 'auto', marginRight: 15 }}>
              <FloatingActionButton
                onClick={() => this.search()}
              >
                <SearchIcon />
              </FloatingActionButton>
            </div>
            <div style={{ marginLeft: 15, marginRight: 'auto' }}
              className='hint--bottom-right hint--rounded'
              aria-label='Browse All'>
              <FloatingActionButton
                onClick={ this.props.onBrowseClicked }
              >
                <WhatshotIcon />
              </FloatingActionButton>
            </div>
          </div>
        }
      </div>
    );
  }

  getInputElement() {
    let minWidth;

    if (this.state.smallScreen && !this.props.reduced) {
      minWidth = 320;
    } else if (!this.state.smallScreen && !this.props.reduced) {
      minWidth = 390;
    } else if (this.state.smallScreen && this.props.reduced) {
      minWidth = 200;
    } else if (!this.state.smallScreen && this.props.reduced) {
      minWidth = 280;
    }

    let hintText = this.props.reduced ? null : 'Search by address, ens domain, or term';
    if (!this.state.smallScreen && !this.props.reduced) {
      hintText += ', e.g. "token"';
    }
    const inputProps = {
      value: this.state.value,
      onChange: this.onChange
    };

    const style = {
      container: {
        position: 'relative',
        minWidth: minWidth
      },
      input: {
        height: 48,
        width: 'calc(100% - 20px)',
        fontFamily: 'Roboto',
        fontSize: 16,
        borderStyle: 'none',
        outline: 'none',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 'auto',
        marginBottom: 'auto',
        transition: 'all 450ms',
        color: 'rgba(0, 0, 0, 0.870588)',
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none'
      },
      suggestionsContainer: {
        display: 'none'
      },
      suggestionsContainerOpen: {
        display: 'block',
        position: 'absolute',
        zIndex: 2,
        backgroundColor: '#fff',
        marginTop: 1,
        left: 0,
        right: 0
      },
      suggestion: {
        cursor: 'pointer'
      },
      suggestionHighlighted: {
        backgroundColor: '#ddd'
      }
    }

    return (
      <div
        onKeyPress={ (e) => { if (e.charCode === 13) {
          e.preventDefault();
          this.search();
        }}}
      >
        <Autosuggest
          suggestions={this.state.autocompleteSuggestions}
          onSuggestionsFetchRequested={this.getAutocompleteSuggestions}
          onSuggestionsClearRequested={
            () => this.setState({autocompleteSuggestions: []})
          }
          getSuggestionValue={ v => v }
          renderSuggestion={ (suggestion, { query }) => {
            return (
              <div
                style={{
                  width: 'calc(100% - 10px)',
                  paddingLeft: 10,
                  paddingTop: 5,
                  paddingBottom: 5
                }}
              >
                {suggestion}
              </div>
            );
          }}
          inputProps={inputProps}
          renderSuggestionsContainer={ ({ containerProps , children, query }) => {
            return (
              <div {... containerProps}>
                <Paper zDepth={1} style={{ textAlign: 'left' }}>
                    {children}
                </Paper>
              </div>
            );
          }}
          theme={style}
          onSuggestionSelected={ (event, {suggestion}) => {
            event.preventDefault();
            this.search(suggestion);
          }}
          renderInputComponent={ props => {
            return (
              <div
                style={{
                  fontSize: 16,
                  height: 48,
                  display: 'inline-block',
                  fontFamily: 'Roboto, sans-serif',
                  width: '100%',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    opacity: this.state.value === '' ? 1 : 0,
                    color: 'rgba(0, 0, 0, 0.298039)',
                    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    bottom: 12,
                    paddingLeft: 10
                  }}
                >
                  {hintText}
                </div>
                <input {...props} spellCheck="false" autoCorrect="off" autoCapitalize="off" />
              </div>
            );
          }}
        />
      </div>
    );
  }
}

SearchBar.propType = {
  onSearchClicked: React.PropTypes.func.isRequired,
  onBrowseClicked: React.PropTypes.func.isRequired,
  autocompleteStore: React.PropTypes.object.isRequired,
  reduced: React.PropTypes.bool.isRequired,
  userAccount: React.PropTypes.string
};

export default withRouter(SearchBar);
