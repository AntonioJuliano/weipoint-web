#### View an Ethereum Contract
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
