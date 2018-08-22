pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

/** @title Bounty contractr. */
contract Bounty is EIP20(1000000 * 10**uint(18), "Bounty Token", 18, "BTY") {

  struct Bounty {
    address owner;
    uint amount;
    bytes32[] submissionIds;
    bytes32 acceptedSubmissionId;
  }

  struct Submission {
    address owner;
    bytes32 bountyId;
    bool rejected;
  }

  bytes32[] public bountyIds;
  bytes32[] public submissionIds;

  mapping (bytes32 => Bounty) public bounties;
  mapping (bytes32 => Submission) public submissions;


  modifier nonEmpty(bytes32 _hash) { require(_hash != 0x0000000000000000000000000000000000000000000000000000000000000000); _;}
  modifier empty(bytes32 _hash) { require(_hash == 0x0000000000000000000000000000000000000000000000000000000000000000); _;}
  modifier isFalse(bool _value) { require(!_value); _;}
  modifier nonZero(uint amount) { require(amount > 0); _;}


  /** @dev Creates a bounty and escrows bounty amount from contract.
  * @param bountyId bounty id.
  * @param amount bounty amount.
  */
  function createBounty(bytes32 bountyId, uint amount) public nonEmpty(bountyId) nonZero(amount) {
    require(bounties[bountyId].owner == 0x0);
    bountyIds.push(bountyId);
    bounties[bountyId].owner = msg.sender;
    bounties[bountyId].amount = amount;
    transfer(this, amount);
  }

  /** @dev Creates a submission for a bounty.
  * @param bountyId id of bounty.
  * @param submissionId id of submission.
  */
  function createSubmission(bytes32 bountyId, bytes32 submissionId) public
    nonEmpty(bountyId) nonEmpty(submissionId) {

    require(submissions[submissionId].owner == 0x0);

    submissionIds.push(submissionId);
    submissions[submissionId].owner = msg.sender;
    submissions[submissionId].bountyId = bountyId;

    bounties[bountyId].submissionIds.push(submissionId);
  }

  /** @dev Lists all bounties.
  * @return list of bounty ids.
  */
  function listBounties() public view returns (bytes32[]) {
    return bountyIds;
  }

  /** @dev Lists all submissions for a given bounty.
  * @return list of submission ids.
  */
  function listBountySubmissions(bytes32 bountyId) public view
    nonEmpty(bountyId) returns (bytes32[]) {
    return bounties[bountyId].submissionIds;
  }

  /** @dev Get accepted submission for a given bounty.
  * @param bountyId id of bounty.
  * @return submission id.
  */
  function getBountyAcceptedSubmission(bytes32 bountyId) public view
    nonEmpty(bountyId) returns (bytes32) {
    return bounties[bountyId].acceptedSubmissionId;
  }

  /** @dev Accepts a given submission, releasing the escrowed bounty amount to the bounty owner.
  * @param submissionId id of submission.
  */
  function acceptSubmission(bytes32 submissionId) public
    nonEmpty(submissionId)
    empty(bounties[submissions[submissionId].bountyId].acceptedSubmissionId)
    isFalse(submissions[submissionId].rejected) {

    require(bounties[submissions[submissionId].bountyId].owner == msg.sender);

    bounties[submissions[submissionId].bountyId].acceptedSubmissionId = submissionId;
    this.transfer(submissions[submissionId].owner, bounties[submissions[submissionId].bountyId].amount);
  }

  /** @dev Rejects a given submission.
  * @param submissionId id of submission.
  */
  function rejectSubmission(bytes32 submissionId) public
    nonEmpty(submissionId)
    empty(bounties[submissions[submissionId].bountyId].acceptedSubmissionId)
    isFalse(submissions[submissionId].rejected) {

    require(bounties[submissions[submissionId].bountyId].owner == msg.sender);
    submissions[submissionId].rejected = true;
  }
}
