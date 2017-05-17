/*global Bugsnag:true*/
if (process.env.NODE_ENV === 'production') {
  require('bugsnag-js');
  Bugsnag.apiKey = "567c3744d32e870cdb69291974b6d1eb";
}
