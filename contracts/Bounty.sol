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
  // submission hash -> bool (rejected)
  mapping (uint => bool) public rejectedSubmissions;
  // submission hash -> bool (rejected)
  mapping (uint => uint[]) public bountyToRejectedSubmissionsMap;

  // check if uint has non-zero value
  modifier nonZero(uint _hash) { require(_hash > 0); _;}

  // check if uint has zero value
  modifier zero(uint _hash) { require(_hash == 0); _;}

  modifier isFalse(bool _value) { require(!_value); _;}

  modifier bountyOwner(uint bountyHash) { require(bountyToOwnerMap[bountyHash] == msg.sender); _;}

  function createBounty(uint bountyHash, uint amount) public nonZero(bountyHash) nonZero(amount) {
    // make sure a bounty with this hash does not exist
    require(bountyAmounts[bountyHash] == 0);

    bounties[msg.sender].push(bountyHash);
    bountyToOwnerMap[bountyHash] = msg.sender;
    bountyAmounts[bountyHash] = amount;
    transfer(this, amount);
  }

  function createSubmission(uint bountyHash, uint submissionHash) public
    nonZero(bountyHash)
    nonZero(submissionHash)
    zero(submissionToBountyMap[submissionHash])  {

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

  function listBountySubmissions(uint bountyHash) public view
    nonZero(bountyHash)
    bountyOwner(bountyHash) returns (uint[]) {
    return bountyToSubmissionsMap[bountyHash];
  }

  function listBountyRejectedSubmissions(uint bountyHash) public view
    nonZero(bountyHash)
    bountyOwner(bountyHash) returns (uint[]) {
    return bountyToRejectedSubmissionsMap[bountyHash];
  }

  function getBountyAcceptedSubmission(uint bountyHash) public view
    nonZero(bountyHash)
    bountyOwner(bountyHash) returns (uint) {
    return bountyToAcceptedSubmissionMap[bountyHash];
  }

  function acceptSubmission(uint submissionHash) public
    nonZero(submissionHash)
    zero(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]])
    isFalse(rejectedSubmissions[submissionHash])
    bountyOwner(submissionToBountyMap[submissionHash]) {

    bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]] = submissionHash;
    this.transfer(submissionToSubmitterMap[submissionHash], bountyAmounts[submissionToBountyMap[submissionHash]]);
  }

  function rejectSubmission(uint submissionHash) public
    nonZero(submissionHash)
    zero(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionHash]])
    isFalse(rejectedSubmissions[submissionHash])
    bountyOwner(submissionToBountyMap[submissionHash]) {

    bountyToRejectedSubmissionsMap[submissionToBountyMap[submissionHash]].push(submissionHash);
    rejectedSubmissions[submissionHash] = true;
  }
}
