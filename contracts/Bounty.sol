pragma solidity ^0.4.23;

import "tokens/contracts/eip20/EIP20.sol";

contract Bounty {
  address public owner;
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
    owner = msg.sender;
    token = new EIP20(tokenAmount, tokenName, tokenDecimals, tokenSymbol);
  }

  // check if uint has non-default value
  modifier nonDefaultValue(uint _hash) { assert(_hash > 0); _;}

  // check if uint has default value
  modifier defaultValue(uint _hash) { assert(_hash == 0); _;}

  function createBounty(uint hash, uint amount) public defaultValue(bountyAmounts[hash]) {

    // escrow the bounty amount
    require(token.transferFrom(msg.sender, this, amount));

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

  function listMySubmission() public view returns (uint[]) {
    return submissions[msg.sender];
  }

  function listBountySubmissions(uint bountyHash) public view returns (uint[] allSubmission, uint acceptedSubmission) {
    require(bountyToOwnerMap[bountyHash] == msg.sender);
    allSubmission = submissions[msg.sender];
    acceptedSubmission = bountyToAcceptedSubmissionMap[bountyHash];
  }

  function acceptSubmission(uint submissionHash) public nonDefaultValue(submissionHash) defaultValue(bountyToAcceptedSubmissionMap[bountyHash]) {
    uint bountyHash = submissionToBountyMap[submissionHash];

    bountyToAcceptedSubmissionMap[bountyHash] = submissionHash;

    require(token.transferFrom(this, submissionToSubmitterMap[submissionHash], bountyAmounts[bountyHash]));
  }
}
