const Bounty = artifacts.require('./Bounty.sol');

module.exports = (deployer) => {
  deployer.deploy(Bounty);
};
