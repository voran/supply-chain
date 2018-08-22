pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

contract Bounty is EIP20(1000000 * 10**uint(18), "Bounty Token", 18, "BTY") {

  // bounty owner -> bounty hashes
  mapping (address => bytes32[]) public bounties;
  // bounty hash -> bounty owner
  mapping (bytes32 => address) public bountyToOwnerMap;
  // bounty hash -> bounty amounts
  mapping (bytes32 => uint) public bountyAmounts;
  // submitter -> submission hashes
  mapping (address => bytes32[]) public submissions;
  // submission hash -> submitter address
  mapping (bytes32 => address) public submissionToSubmitterMap;
  // submission hash -> bounty hash
  mapping (bytes32 => bytes32) public submissionToBountyMap;
  // bounty hash to submissions map
  mapping (bytes32 => bytes32[]) public bountyToSubmissionsMap;
  // bounty hash -> accepted submission hash
  mapping (bytes32 => bytes32) public bountyToAcceptedSubmissionMap;
  // submission hash -> bool (rejected)
  mapping (bytes32 => bool) public rejectedSubmissions;
  // submission hash -> bool (rejected)
  mapping (bytes32 => bytes32[]) public bountyToRejectedSubmissionsMap;

  modifier nonEmpty(bytes32 _hash) { require(_hash != 0x0000000000000000000000000000000000000000000000000000000000000000); _;}
  modifier empty(bytes32 _hash) { require(_hash == 0x0000000000000000000000000000000000000000000000000000000000000000); _;}
  modifier isFalse(bool _value) { require(!_value); _;}
  modifier nonZero(uint amount) { require(amount > 0); _;}

  modifier bountyOwner(bytes32 bountyHash) { require(bountyToOwnerMap[bountyHash] == msg.sender); _;}

  function createBounty(bytes32 bountyHash, uint amount) public nonEmpty(bountyHash) nonZero(amount) {
    // make sure a bounty with this hash does not exist
    require(bountyAmounts[bountyHash] == 0);

    bounties[msg.sender].push(bountyHash);
    bountyToOwnerMap[bountyHash] = msg.sender;
    bountyAmounts[bountyHash] = amount;
    transfer(this, amount);
  }

  function createSubmission(bytes32 bountyHash, bytes32 submissionHash) public
    nonEmpty(bountyHash)
    nonEmpty(submissionHash)
    empty(submissionToBountyMap[submissionHash])  {

    submissions[msg.sender].push(submissionHash);
    submissionToBountyMap[submissionHash] = bountyHash;
    bountyToSubmissionsMap[bountyHash].push(submissionHash);
    submissionToSubmitterMap[submissionHash] = msg.sender;
  }

  function listMyBounties() public view returns (bytes32[]) {
    return bounties[msg.sender];
  }

  function listMySubmissions() public view returns (bytes32[]) {
    return submissions[msg.sender];
  }

  function listBountySubmissions(bytes32 bountyHash) public view
    nonEmpty(bountyHash)
    bountyOwner(bountyHash) returns (bytes32[]) {
    return bountyToSubmissionsMap[bountyHash];
  }

  function listBountyRejectedSubmissions(bytes32 bountyHash) public view
    nonEmpty(bountyHash)
    bountyOwner(bountyHash) returns (bytes32[]) {
    return bountyToRejectedSubmissionsMap[bountyHash];
  }

  function getBountyAcceptedSubmission(bytes32 bountyHash) public view
    nonEmpty(bountyHash)
    bountyOwner(bountyHash) returns (bytes32) {
    return bountyToAcceptedSubmissionMap[bountyHash];
  }

  function acceptSubmission(bytes32 submissionHash) public
    nonEmpty(submissionHash)
    empty(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]])
    isFalse(rejectedSubmissions[submissionHash])
    bountyOwner(submissionToBountyMap[submissionHash]) {

    bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]] = submissionHash;
    this.transfer(submissionToSubmitterMap[submissionHash], bountyAmounts[submissionToBountyMap[submissionHash]]);
  }

  function rejectSubmission(bytes32 submissionHash) public
    nonEmpty(submissionHash)
    empty(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]])
    isFalse(rejectedSubmissions[submissionHash])
    bountyOwner(submissionToBountyMap[submissionHash]) {

    bountyToRejectedSubmissionsMap[submissionToBountyMap[submissionHash]].push(submissionHash);
    rejectedSubmissions[submissionHash] = true;
  }
}
