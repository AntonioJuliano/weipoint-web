import React from 'react';
import { withRouter } from 'react-router-dom';
import paths from '../lib/ApiPaths';
import isEqual from 'lodash.isequal';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import KeybaseBadge from './KeybaseBadge';
import GithubBadge from './GithubBadge';
import FacebookBadge from './FacebookBadge';
import RedditBadge from './RedditBadge';
import TwitterBadge from './TwitterBadge';
import BitcoinAddressBadge from './BitcoinAddressBadge';
import WebsiteBadge from './WebsiteBadge';
import Dialog from 'material-ui/Dialog';
import JSONPretty from 'react-json-pretty';

const REQUEST_STATES = {
  INITIAL: 0,
  COMPLETED: 1
};

const initialState = {
  requestState: REQUEST_STATES.INITIAL,
  services: null,
  showProof: false,
  proof: null
};

class Verifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.fetch = this.fetch.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
    this.getBadgeElements = this.getBadgeElements.bind(this);
    this.getServices = this.getServices.bind(this);

    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(initialState);
      this.fetch(nextProps);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.fetch(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async fetch(props) {
    const type = this.props.type;
    const userID = this.props.userID;

    const requestPath = paths.verification.get + `?type=${type}&userIDs=${userID}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });

      if (response.status !== 200) {
        return;
      }
      let verifications = await response.json();

      let services = this.getServices(verifications);

      const linkPromises = verifications.map(this.getLinkedKeybaseServices);
      const linkedServices = await Promise.all(linkPromises);

      const extraServices = [].concat.apply([], linkedServices);

      if (this.mounted) {
        this.setState({
          requestState: REQUEST_STATES.COMPLETED,
          services: services.concat(extraServices),
          proof: verifications
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getLinkedKeybaseServices(v) {
    if (v.services.find( s => s.type === 'keybase' )) {
      const keybaseUserID = v.services.find( s => s.type === 'keybase' ).userID;
      const keybasePath =
        `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${keybaseUserID}`;
      const keybaseResponse = await fetch(keybasePath, { method: 'get' });

      if (keybaseResponse.status === 200) {
        const keybaseJson = await keybaseResponse.json();

        if (keybaseJson.them.length > 0) {
          const keybaseLinks = keybaseJson.them[0].proofs_summary.all;
          let links = keybaseLinks.map( l => {
            return {
              type: l.proof_type,
              userID: l.nametag
            };
          });
          const bitcoinAddresses =
            keybaseJson.them[0].cryptocurrency_addresses.bitcoin;
          if (bitcoinAddresses && bitcoinAddresses.length > 0) {
            links = links.concat(bitcoinAddresses.map( a => {
              return { type: 'bitcoin', userID: a.address };
            }));
          }

          return links;
        }
      }
    }

    return [];
  }

  getBodyElement() {
    switch (this.state.requestState) {
      case REQUEST_STATES.INITIAL:
        if (this.props.showLoader) {
          return (
            <div style={{ width: '100%' }}>
              <RefreshIndicator
                size={50}
                left={0}
                top={0}
                loadingColor="#9b59b6"
                status="loading"
                style={{
                  position: 'relative',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 50
                }}
              />
            </div>
          );
        }
        return null;
      case REQUEST_STATES.COMPLETED:
        return this.getBadgeElements(this.state.services);
      default:
        console.error('Invalid requestState ' + this.state.requestState);
        return null;
    }
  }

  getBadgeElements(services) {
    if (services.length === 0) {
      return this.props.noVerificationsElement;
    }
    const spacing = 8;
    let badges = services.map( s => {
      switch (s.type) {
        case 'keybase':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'keybase-' + s.userID}
            >
              <KeybaseBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'github':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'github-' + s.userID}
            >
              <GithubBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'facebook':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'facebook-' + s.userID}
            >
              <FacebookBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'reddit':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'reddit-' + s.userID}
            >
              <RedditBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'twitter':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'twitter-' + s.userID}
            >
              <TwitterBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'bitcoin':
          return (
            <div
              style={{ marginRight: spacing, marginTop: spacing }}
              key={'bitcoin-' + s.userID}
            >
              <BitcoinAddressBadge
                username={s.userID}
                link={true}
              />
            </div>
          );
        case 'dns':
        case 'generic_web_site':
        return (
          <div
            style={{ marginRight: spacing, marginTop: spacing }}
            key={'bitcoin-' + s.userID}
          >
            <WebsiteBadge
              username={s.userID}
              link={true}
            />
          </div>
        );
        default:
          console.log('unknown service type: ' + s.type);
          return null;
      }
    });

    if (!this.props.hideProof) {
      badges.push(
        <div style={{ marginTop: spacing }} key='show-proof'>
          <div
            style={{
              height: 28,
              fontSize: 12,
              color: '#4c4c4c'
            }}
          >
            <div
              style={{ marginTop: 8, marginBottom: 8, cursor: 'pointer' }}
              onClick={ () => this.setState({ showProof: true }) }
            >
              {'View Proof'}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: -spacing }}>
        {badges}
      </div>
    );
  }

  getServices(verifications) {
    const services =  verifications.map(
      v => v.services.find( s => s.type !== this.props.type )
    ).map( s => { return { type: s.type, userID: s.userID } });

    return services.filter( (i, idx, arr) => arr.indexOf(i) === idx); // Removes duplicates
  }

  render() {
    return <div>
      {this.getBodyElement()}
      <Dialog
        modal={false}
        open={this.state.showProof}
        onRequestClose={ () => this.setState({ showProof: false }) }
      >
        <JSONPretty id="verification-proof" json={this.state.proof} />
      </Dialog>
    </div>;
  }
}

Verifications.propTypes = {
  type: React.PropTypes.string.isRequired,
  userID: React.PropTypes.string.isRequired,
  showLoader: React.PropTypes.bool,
  noVerificationsElement: React.PropTypes.node,
  hideProof: React.PropTypes.bool
};

export default withRouter(Verifications);
