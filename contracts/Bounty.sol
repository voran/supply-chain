pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

/** @title Bounty contractr. */
contract Bounty is EIP20(1000000 * 10**uint(18), "Bounty Token", 18, "BTY") {

  // bounty owner -> bounty hashes
  bytes32[] public bounties;
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
  // bounty hash- to submissions map
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


  modifier bountyOwner(bytes32 bountyId) { require(bountyToOwnerMap[bountyId] == msg.sender); _;}

  /** @dev Creates a bounty and escrows bounty amount from contract.
  * @param bountyId bounty id.
  * @param amount bounty amount.
  */
  function createBounty(bytes32 bountyId, uint amount) public nonEmpty(bountyId) nonZero(amount) {
    // make sure a bounty with this hash does not exist
    require(bountyAmounts[bountyId] == 0);

    bounties.push(bountyId);
    bountyToOwnerMap[bountyId] = msg.sender;
    bountyAmounts[bountyId] = amount;
    transfer(this, amount);
  }

  /** @dev Creates a submission for a bounty.
  * @param bountyId id of bounty.
  * @param submissionId id of submission.
  */
  function createSubmission(bytes32 bountyId, bytes32 submissionId) public
    nonEmpty(bountyId)
    nonEmpty(submissionId)
    empty(submissionToBountyMap[submissionId])  {

    submissions[msg.sender].push(submissionId);
    submissionToBountyMap[submissionId] = bountyId;
    bountyToSubmissionsMap[bountyId].push(submissionId);
    submissionToSubmitterMap[submissionId] = msg.sender;
  }

  /** @dev Lists all bounties.
  * @return list of bounty ids.
  */
  function listBounties() public view returns (bytes32[]) {
    return bounties;
  }

  /** @dev Lists submissions owned by caller.
  * @return list of submission ids.
  */
  function listMySubmissions() public view returns (bytes32[]) {
    return submissions[msg.sender];
  }

  /** @dev Lists all submissions for a given bounty.
  * @return list of submission ids.
  */
  function listBountySubmissions(bytes32 bountyId) public view
    nonEmpty(bountyId)
    returns (bytes32[]) {

    return bountyToSubmissionsMap[bountyId];
  }

  /** @dev Lists rejected submissions for a given bounty.
  * @param bountyId id of bounty.
  * @return list of submission ids.
  */
  function listBountyRejectedSubmissions(bytes32 bountyId) public view
    nonEmpty(bountyId) returns (bytes32[]) {
    return bountyToRejectedSubmissionsMap[bountyId];
  }

  /** @dev Get accepted submission for a given bounty.
  * @param bountyId id of bounty.
  * @return submission id.
  */
  function getBountyAcceptedSubmission(bytes32 bountyId) public view
    nonEmpty(bountyId) returns (bytes32) {
    return bountyToAcceptedSubmissionMap[bountyId];
  }

  /** @dev Accepts a given submission, releasing the escrowed bounty amount to the bounty owner.
  * @param submissionId id of submission.
  */
  function acceptSubmission(bytes32 submissionId) public
    nonEmpty(submissionId)
    empty(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionId]])
    isFalse(rejectedSubmissions[submissionId])
    bountyOwner(submissionToBountyMap[submissionId]) {

    bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionId]] = submissionId;
    this.transfer(submissionToSubmitterMap[submissionId], bountyAmounts[submissionToBountyMap[submissionId]]);
  }

  /** @dev Rejects a given submission.
  * @param submissionId id of submission.
  */
  function rejectSubmission(bytes32 submissionId) public
    nonEmpty(submissionId)
    empty(bountyToAcceptedSubmissionMap[submissionToBountyMap[submissionId]])
    isFalse(rejectedSubmissions[submissionId])
    bountyOwner(submissionToBountyMap[submissionId]) {

    bountyToRejectedSubmissionsMap[submissionToBountyMap[submissionId]].push(submissionId);
    rejectedSubmissions[submissionId] = true;
  }
}
