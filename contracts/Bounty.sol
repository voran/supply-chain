pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

contract Bounty {
  EIP20 token;

  string constant tokenName = "Bounty Token";
  uint8 constant tokenDecimals = 18;
  uint256 constant tokenAmount =  1000000 * 10**uint(tokenDecimals);
  string constant tokenSymbol = "BTY";

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

  constructor() public {
    token = new EIP20(tokenAmount, tokenName, tokenDecimals, tokenSymbol);
  }

  // check if uint has non-default value
  modifier nonDefaultValue(uint _hash) { assert(_hash > 0); _;}

  // check if uint has default value
  modifier defaultValue(uint _hash) { assert(_hash == 0); _;}

  modifier bountyOwner(uint bountyHash) { require(bountyToOwnerMap[bountyHash] == msg.sender); _;}

  function createBounty(uint hash, uint amount) public {
    // make sure a bounty with this hash does not exist
    require(bountyAmounts[hash] == 0);

    bounties[msg.sender].push(hash);
    bountyToOwnerMap[hash] = msg.sender;
    bountyAmounts[hash] = amount;
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
    uint bountyAmount = bountyAmounts[bountyHash];
    address submitterAddress = submissionToSubmitterMap[submissionHash];
    bountyToAcceptedSubmissionMap[bountyHash] = submissionHash;

    token.approve(submitterAddress, bountyAmount);
    return token.transfer(submitterAddress, bountyAmount);
  }
}
