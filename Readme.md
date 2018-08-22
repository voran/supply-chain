# Bounty System Dapp
This system is a distributed app for a bounty system. It uses IPFS for file/metadata storage and the blockchain for permissions and state management. Is also uses an EIP20 token for payments. The following user stories are implemented:

## User Submits Bounty
A user may submit a bounty for some work to be done. They may set an name, a sort description, and an amount. The bounty name, amount, and description is then saved to ipfs. The bounty and the amount is then also saved on the blockchain, and the bounty amount is escrowed from the submitter account.

## User Lists Bounties

# Set Up
* We assume that you have truffle ganache, and ipfs already installed.
* This will not use Metamask for web3 but will inject its own, if you wish to use metamask you need to change src/application.js

## Dependencies
```
$ npm install
$ truffle compile

$ ipfs init
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
```


## Running
```
# run in separate terminals:
npm start
ipfs daemon
ganache-cli
```

## Testing
```
truffle test
```

Then navigate to [localhost:3000](http://localhost:3000).
