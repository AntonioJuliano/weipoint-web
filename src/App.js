/*global web3:true*/

// Polyfill needed for IE
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" &&
           isFinite(value) &&
           Math.floor(value) === value;
};

import React, { Component } from 'react';
import Search from './components/Search';
import Web3 from 'web3';
import theme from './lib/theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import Footer from './components/Footer';
import bluebird from 'bluebird';

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

class App extends Component {
  constructor(props) {
    super(props);

    let newWeb3;
    if (typeof web3 !== 'undefined') {
      newWeb3 = new Web3(web3.currentProvider);
    } else {
      newWeb3 = new Web3();

      // This is needed because web3 could be injected after react starts
      window.addEventListener('load', () => {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
          const updatedWeb3 = new Web3(web3.currentProvider);
          bluebird.promisifyAll(updatedWeb3.eth);
          this.setState({ web3: updatedWeb3 });
        }
      });
    }
    bluebird.promisifyAll(newWeb3.eth);

    this.state = {
      web3: newWeb3
    };
  }

  render() {
    return (
      <Router>
        <div className='App'
          style={{
            backgroundColor: '#efefef',
            minWidth: '100%',
            width: '100%',
            minHeight: '100vh',
            height: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
          <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
            <div style={{ minHeight: '100vh', flexDirection: 'column', display: 'flex' }}>
              <Route
                path="/"
                render={ () => {
                  return (
                    <main style={{ flex: '1 1 auto' }}>
                      <Search web3={this.state.web3} />
                    </main>
                  );
                }}/>
              <Footer />
            </div>
          </MuiThemeProvider>
        </div>
      </Router>
    );
  }
}

export default App;
