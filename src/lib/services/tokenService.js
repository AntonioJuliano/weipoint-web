import BigNumber from 'bignumber.js';
import { Promise as bluebirdPromise } from 'bluebird';

async function sendToken(token, amount, fromAddress, toAddress, web3) {
  const decimals = token.decimals > 0 ? token.decimals - 1 : 0;

  bluebirdPromise.promisifyAll(web3.version);
  const networkVersion = await web3.version.getNetworkAsync();
  console.log(networkVersion);
  console.log(typeof networkVersion);
  if (networkVersion !== 1 && networkVersion !== '1') {
    throw new Error('Wallet not set to mainnet');
  }

  web3.eth.defaultAccount = fromAddress;

  if (token.isEth) {
    const bigNumAmount = new BigNumber(amount).times(new BigNumber('10e+' + decimals));
    const tx = {
      from: fromAddress,
      to: toAddress,
      value: bigNumAmount
    };
    return web3.eth.sendTransactionAsync(tx);
  } else {
    const contractInstance = web3.eth.contract(token.contractABI).at(token.contractAddress);
    bluebirdPromise.promisifyAll(contractInstance);
    const bigNumAmount = new BigNumber(amount).times(new BigNumber('10e+' + decimals));
    return contractInstance.transferAsync(toAddress, bigNumAmount);
  }
}

function formatBalance(balance) {
  const decimals = balance.decimals > 0 ? balance.decimals - 1 : 0;
  const formatted = new BigNumber(balance.balance)
    .dividedBy(new BigNumber('10e+' + decimals))
    .toFormat(8);

  const truncated = formatted.replace(/\.?0+$/, '');
  const numSpaces = formatted.length - truncated.length;

  // Want decimal places to be aligned so give all the same decimal spacing
  return truncated + '\u00a0'.repeat(numSpaces);
}

function hasBalance(balance, input) {
  const bigNumBalance = new BigNumber(balance.balance);
  const decimals = balance.decimals > 0 ? balance.decimals - 1 : 0;
  const bigNumInput = new BigNumber(input).times(new BigNumber('10e+' + decimals));

  return bigNumBalance.comparedTo(bigNumInput) >= 0;
}

function supportsPrecision(token, input) {
  const regex = new RegExp('.?[0-9]{0,num}$'.replace('num', token.decimals));
  return input.match(regex);
}

module.exports.sendToken = sendToken;
module.exports.formatBalance = formatBalance;
module.exports.hasBalance = hasBalance;
module.exports.supportsPrecision = supportsPrecision;
