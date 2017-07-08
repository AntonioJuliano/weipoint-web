const DEFAULT = 'Read our guide [here](https://medium.com/weipoint/weipoint-a-guide-b3d162ee7f3)';
const HOMEPAGE = `#### How to Search on Weipoint
Weipoint allows you to search for decentralized content. Some things you can search for include: Ethereum smart contracts, ENS domain names, Ethereum addresses, and more.

Weipoint lets you search by terms, so you could search “token” to find new tokens, “golem” to quickly find the Golem project’s contracts, or “game” if you’re looking for some new decentralized fun. You can also search a specific address to navigate right to an Ethereum contract or account. Additionally, you can search for .eth domain names such as "registrar.gimmethe.eth".

If you’re not sure what you’re looking for, try some of the autocomplete suggestions, or just browse all contracts sorted by importance.

#### What is Ethereum?
Ethereum is a blockchain platform which allows developers to build decentralized applications. It is also a cryptocurrency similar to Bitcoin.

#### What is an Ethereum Contract?
Contracts are decentralized programs which run and keep state on the Ethereum blockchain. They are the backbone of decentralized apps.

#### What is an Ethereum Address?
An address is a unique public identifier used on the Ethereum blockchain. Addresses are used to identify both contracts as well as individual user accounts. They usually look something like 0xdc9fbececa49457fbcb2ee1dfd576a8be06a5c30.

#### What is an ENS Domain?
ENS is a domain service which gives human readable names to decentralized content. With it you you could use website.eth instead of 0x209c4784a…fc18ef.
`;
const SEARCH = `#### Search Results on Weipoint
Once you make a search on Weipoint, you'll see a list of results related to your query. These results currently consist of of Ethereum contracts. Results are ranked both by relevance and importance, so the most relevant results will probably be towards the top.

On each result preview you'll see the name of the contract as specified in its source code (or "Contract" if no source code is available), as well as a description, relevant link, and list of tags if available. Click on the result's title to navigate to the contract where you can see more information, as well as interact with it.

#### What is Ethereum?
Ethereum is a blockchain platform which allows developers to build decentralized applications. It is also a cryptocurrency similar to Bitcoin.

#### What is an Ethereum Contract?
Contracts are decentralized programs which run and keep state on the Ethereum blockchain. They are the backbone of decentralized apps.
`;
const ADDRESS = `#### View an Ethereum Contract
With Weipoint you can read and use Ethereum smart contracts. Read on to see what each tab does.

##### Overview
You can view the contract's description, website, and tags here. You can also update or add to any of these fields. Simply start typing new tags, or add a website/description and new users will be able to more easily discover your app. New information may be subject to review before it becomes live.

##### Upload/View Source
If the contract already has verified source code, you can view it on this tab. Weipoint currently supports contracts written in Solidity, a programming language specifically designed for contracts. Whatever you see here is what executes directly on the blockchain.

If the contract does not yet have verified source code, you can add it here. In addition to the Solidity source code, you'll need to supply the compiler version, and optimized flag used to compile this contract. Weipoint will then verify that the supplied code matches the bytecode that exists on the blockchain. If you're a dApp developer, verifying you contract's source code is a great way to help users discover and trust your dApp.

##### Read Contract (verified contracts only)
Here you can read public information defined by this contract directly from the blockchain. Fields that don't require input are automatically displayed. To read a dynamic field that requires input, click on the name of the field to expand the arguments it takes. Once you have filled everything in, click "call" to see the result. As an example, for a token contract you could supply the "balanceOf" field with an address to see the token balance of that address.

##### Interact (verified contracts only)
*Note: you'll need an Ethereum wallet (such as Metamask) with ether to use this feature*

Weipoint allows you to send transactions directly to contracts on the blockchain. This means you could do things like transfer a token, or register an ens domain right on Weipoint. See an example on our post [here](https://medium.com/weipoint/weipoint-a-guide-b3d162ee7f3). Weipoint uses your wallet to sign the transaction, so you're always in control of your funds.

Similar to the read contract section, click on a function to expand the arguments it takes, and then click "Call" to initiate the transaction. You will have to approve it in your wallet before it is final.

*Warning: Use this at your own risk. You could lose funds if you prepare an invalid transaction*

#### View an Ethereum Account
You can also view non-contract Ethereum accounts with Weipoint. These accounts belong to individual users.

##### View Token Balances
While viewing an account you can see the balances of all tokens, including ETH, it holds. This can be useful if you want to hold a new token not directly supported by your wallet. Weipoint automatically discovers tokens on the blockchain, so new ones will continue to be added.

#### What is an Ethereum Contract?
Contracts are decentralized programs which run and keep state on the Ethereum blockchain. They are the backbone of decentralized apps.

#### What is an Ethereum Address?
An address is a unique public identifier used on the Ethereum blockchain. Addresses are used to identify both contracts as well as individual user accounts. They usually look something like 0xdc9fbececa49457fbcb2ee1dfd576a8be06a5c30.

#### What is a Token?
A token is a cryptocurrency which exists on top of Ethereum. A smart contract is used to govern the rules of the currency.
`;
const DOMAIN = `#### ENS Domains on Weipoint
Searching for a .eth domain name on weipoint will bring up a page that displays information such as the owner, if it is available for purchase, and most importantly the contract or account it resolves to. We currently support domains that link to Ethereum contracts or accounts. If the domain is set up, click on the domain name at the top to navigate to the contract/account the domain links to.

If you're interested in acquiring the domain, use the link to the ENS dApp where you can place a bid or configure the domain.

#### What is an ENS Domain?
ENS is a domain service which gives human readable names to decentralized content. With it you you could use website.eth instead of 0x209c4784a…fc18ef.
`;
const WALLET= `#### Weipoint Token Wallet
Weipoint interfaces with your Ethereum wallet, such as MetaMask, to display and send tokens. Tokens are held by Ethereum addresses, so in the same way your wallet is used to store ETH, it can also store any other standard token. Weipoint automatically finds and displays tokens you own. In order to send tokens, you need to send a transaction with specific data to the smart contract which governs the token. Weipoint provides a simple interface so you can just input the amount and destination, and we handle creating the transaction for you. The transaction needs to be signed by you before it’s valid.

##### Listing Your Own Token
It’s super easy to add any new ERC20 compliant token to the Weipoint Token Wallet. Simply find your token’s contract on Weipoint by searching its address, and then upload source code for your contract. If your contract is a token, we’ll automatically add it to the wallet, and anyone who holds your token will be able to see and transfer it right away.

#### What is a Token?
A token is a cryptocurrency which exists on top of Ethereum. A smart contract is used to govern the rules of the currency. Tokens are often used to interact with dApps.
`;

const VERIFY_ADDRESS = `#### Verify Address
Weipoint allows you to publicly link your ethereum address with your external internet accounts. To do this you will need a Keybase account, as well as a web3 wallet such as Metamask or Mist which holds this address. Verification is done by cryptographically signing a message claiming you own both this address and a Keybase account. Once you have signed this message, anyone can provably verify its authenticity, and tell that your Keybase account owns this address. After you have completed the verification anyone will be able to discover you by your Keybase username, as well as any other usernames of accounts (such as Facebook, Github, etc.) you have linked with Keybase.

##### What is Keybase?
Keybase is platform which gives you a cryptographic key pair, and allows you to link it with external internet services such as Facebook, Github, Twitter, and more. It uses cryptographic proofs to provable verify your Keybase account owns all the services linked with it.

##### How do I link external services to my Keybase?
You can prove ownership of external services such as Facebook, Twitter, Github, and more by following the instructions on your Keybase page (www.keybase.io/<yourusername>).
`;

function getHelpDoc(location) {
  const path = location.pathname.match(/^\/\w*/)[0];

  if (location.pathname.match(/^\/(wallet|address)\/.*verify$/)) {
    return VERIFY_ADDRESS;
  }

  switch (path) {
    case '/':
      return HOMEPAGE;
    case '/all':
    case '/search':
      return SEARCH;
    case '/domain':
      return DOMAIN;
    case '/address':
      // TODO differentiate between contract and eoa
      return ADDRESS;
    case '/wallet':
      return WALLET;
    default:
      return DEFAULT;
  }
}
export default getHelpDoc;
