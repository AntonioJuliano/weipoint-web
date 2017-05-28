import React from 'react';
import GoogleAnalytics from 'react-ga';

if (process.env.NODE_ENV === 'production') {
  GoogleAnalytics.initialize('UA-97392415-1');
}

function withTracker(WrappedComponent) {
  const trackPage = (page) => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    GoogleAnalytics.set({ page });
    GoogleAnalytics.pageview(page);
  };

  const HOC = (props) => {
    const page = props.location.pathname;
    trackPage(page);

    return (
      <WrappedComponent {...props} />
    );
  };

  return HOC;
};

function trackEvent({ category, action, label, value }) {
  GoogleAnalytics.event({
    category,
    action,
    label,
    value
  });
}

function setUser(id) {
  GoogleAnalytics.set({ userId: id });
}

function trackException({ description, fatal }) {
  GoogleAnalytics.event({
    description,
    fatal
  });
}

module.exports.withTracker = withTracker;
module.exports.trackEvent = trackEvent;
module.exports.setUser = setUser;
module.exports.trackException = trackException;
