pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

contract Bounty is EIP20(1000000 * 10**uint(18), "Bounty Token", 18, "BTY") {

  // bounty owner -> bounty hashes
  mapping (address => uint[]) public bounties;
  // bounty hash -> bounty owner
  mapping (uint => address) public bountyToOwnerMap;
  // bounty hash -> bounty amounts
  mapping (uint => uint) public bountyAmounts;
  // submitter -> submission hashes
  mapping (address => uint[]) public submissions;
  // submission hash -> submitter address
  mapping (uint => address) public submissionToSubmitterMap;
  // submission hash -> bounty hash
  mapping (uint => uint) public submissionToBountyMap;
  // bounty hash to submissions map
  mapping (uint => uint[]) public bountyToSubmissionsMap;
  // bounty hash -> accepted submission hash
  mapping (uint => uint) public bountyToAcceptedSubmissionMap;

  // check if uint has non-default value
  modifier nonDefaultValue(uint _hash) { assert(_hash > 0); _;}

  // check if uint has default value
  modifier defaultValue(uint _hash) { assert(_hash == 0); _;}

  modifier bountyOwner(uint bountyHash) { require(bountyToOwnerMap[bountyHash] == msg.sender); _;}

  function createBounty(uint hash, uint amount) public returns (bool) {
    // make sure a bounty with this hash does not exist
    require(bountyAmounts[hash] == 0);

    bool transferSuccess = transfer(this, amount);

    if (transferSuccess) {
      bounties[msg.sender].push(hash);
      bountyToOwnerMap[hash] = msg.sender;
      bountyAmounts[hash] = amount;
    }
    return transferSuccess;
  }

  function createSubmission(uint bountyHash, uint submissionHash) public
    defaultValue(submissionToBountyMap[submissionHash]) nonDefaultValue(bountyHash) nonDefaultValue(submissionHash) {

    submissions[msg.sender].push(submissionHash);
    submissionToBountyMap[submissionHash] = bountyHash;
    bountyToSubmissionsMap[bountyHash].push(submissionHash);
    submissionToSubmitterMap[submissionHash] = msg.sender;
  }

  function listMyBounties() public view returns (uint[]) {
    return bounties[msg.sender];
  }

  function listMySubmissions() public view returns (uint[]) {
    return submissions[msg.sender];
  }

  function listBountySubmissions(uint bountyHash) public view bountyOwner(bountyHash) returns (uint[]) {
    return bountyToSubmissionsMap[bountyHash];
  }

  function getBountyAcceptedSubmission(uint bountyHash) public view bountyOwner(bountyHash) returns (uint) {
    return bountyToAcceptedSubmissionMap[bountyHash];
  }

  function acceptSubmission(uint submissionHash) public nonDefaultValue(submissionHash) defaultValue(bountyToAcceptedSubmissionMap[bountyHash]) returns (bool) {
    uint bountyHash = submissionToBountyMap[submissionHash];
    uint256 bountyAmount = bountyAmounts[bountyHash];
    address submitterAddress = submissionToSubmitterMap[submissionHash];
    bool transferSuccess = this.transfer(submitterAddress, bountyAmount);
    if (transferSuccess) {
      bountyToAcceptedSubmissionMap[bountyHash] = submissionHash;
    }
    return transferSuccess;
  }
}
