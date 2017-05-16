const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://api.weipoint.com';

const paths = {
  contract: {
    get: origin + '/api/v1/contract',
    metadata: origin + '/api/v1/contract/metadata',
    source: origin + '/api/v1/contract/source',
    constantFunction: origin + '/api/v1/contract/constantFunction',
    compilerVersions: origin + '/api/v1/contract/compilerVersions'
  },
  data: {
    price: origin + '/api/v1/data/price'
  },
  search: {
    get: origin + '/api/v1/search',
    autocomplete: origin + '/api/v1/search/autocomplete'
  },
  ens: {
    get: origin + '/api/v1/ens'
  }
}

export default paths;
