# Bounty System Dapp
This system is a distributed app for a bounty system. It uses IPFS for file/metadata storage and the blockchain for permissions and state management. Is also uses an EIP20 token for payments. The following user stories are implemented:

## User Submits Bounty
A user may submit a bounty for some work to be done. They may set an name, a sort description, and an amount. The bounty name, amount, and description is then saved to ipfs. The bounty and the amount is then also saved on the blockchain, and the bounty amount is escrowed from the submitter account.

## User Lists Bounties
A user may
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
ipfs daemon
ganache-cli
truffle migrate && npm start
```
Then navigate to [localhost:3000](http://localhost:3000).

## Testing
Tests have been developed to test the happy case (create bounty -> create submission -> approve submission), as well as different boundary conditions and failure scenarios, including:
* Trying to create a bounty with an already existing id
* Trying to create a bounty when contract is paused.
* Trying to create a submission for an already existing submission
* Trying to create a submission for a non-existent bounty.
* Trying to create a submission when contract is paused.
* Trying to accept/reject a submission for a bounty you don't own.
* Trying to accept/reject a submission which is already accepted/rejected.
* Trying to accept/reject a submission when the bounty already has an accepted submission.
* Trying to accept/reject a submission when contract is paused.
* Trying to emergency stop/resume contract when not contract owner.

```
truffle test
```

## TODO
### Design Patterns
#### Emergency Stop
The emergency stop pattern is used to enable the contract owner stop any state changes in case a
vulnerability in the contract is discovered.

### Others
See design_pattern_decisions.md




### Security Tools / Common Attacks
* A document called avoiding_common_attacks.md that explains what measures you took to ensure that your contracts are not susceptible to common attacks. (Module 9 Lesson 3)


## Stretch Requirements Fulfilled
* Used IPFS
