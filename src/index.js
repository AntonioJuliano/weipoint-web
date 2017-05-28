import "babel-polyfill";
import './lib/Bugsnag';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import withTracker from './lib/withTracker';

ReactDOM.render(
  <Router>
    <Route component={withTracker(App)} />
  </Router>,
  document.getElementById('root')
);
