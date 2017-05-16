import React from "react";
import ReportProblemIcon from 'react-material-icons/icons/action/report-problem';
import { yellow700 } from 'material-ui/styles/colors';
import SearchStatus from './SearchStatus';

class NotFound extends React.Component {
  render() {
    return (
      <SearchStatus
        icon={
          <ReportProblemIcon color={yellow700} style={{
            width: 48,
            height: 48
          }}/>
        }
        message={'No results found matching: "' + this.props.query + '"'}
      />
    );
  }
}

NotFound.propTypes = {
  query: React.PropTypes.string.isRequired
}

export default NotFound;
