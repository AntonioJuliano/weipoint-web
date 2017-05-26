import BigNumber from 'bignumber.js';
import { Promise as bluebirdPromise } from 'bluebird';

async function sendToken(token, amount, fromAddress, toAddress, web3) {
  const decimals = token.decimals;
  const bigNumAmount = decimals !== 0 ?
    new BigNumber(amount).times(new BigNumber('10e+' + (decimals-1))) :
    new BigNumber(amount);
  console.log(bigNumAmount.toString());

  bluebirdPromise.promisifyAll(web3.version);
  const networkVersion = await web3.version.getNetworkAsync();
  if (networkVersion !== 1 && networkVersion !== '1') {
    throw new Error('Wallet not set to mainnet');
  }

  web3.eth.defaultAccount = fromAddress;

  if (token.isEth) {
    const tx = {
      from: fromAddress,
      to: toAddress,
      value: bigNumAmount
    };
    return web3.eth.sendTransactionAsync(tx);
  } else {
    const contractInstance = web3.eth.contract(token.contractABI).at(token.contractAddress);
    bluebirdPromise.promisifyAll(contractInstance);
    return contractInstance.transferAsync(toAddress, bigNumAmount);
  }
}

function formatBalance(balance) {
  const formatted = _bigNumBalance(balance.decimals, balance.balance).toFormat(8);

  const truncated = formatted.replace(/\.?0+$/, '');
  const numSpaces = formatted.length - truncated.length;

  // Want decimal places to be aligned so give all the same decimal spacing
  return truncated + '\u00a0'.repeat(numSpaces);
}

function hasBalance(balance, input) {
  const bigNumBalance = _bigNumBalance(balance.decimals, balance.balance);
  const bigNumInput = new BigNumber(input);

  return bigNumBalance.comparedTo(bigNumInput) >= 0;
}

function _bigNumBalance(decimals, bal) {
  const divisor = decimals !== 0 ? new BigNumber('10e+' + (decimals- 1)) : new BigNumber(1);
  return new BigNumber(bal).dividedBy(divisor);
}

module.exports.sendToken = sendToken;
module.exports.formatBalance = formatBalance;
module.exports.hasBalance = hasBalance;
