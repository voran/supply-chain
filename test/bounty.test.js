const Bounty = artifacts.require('./Bounty.sol');
const EIP20 = artifacts.require('tokens/contracts/eip20/EIP20.sol');

contract('Bounty', ([owner, alice, bob, charlie]) => {
  let bounty;

  beforeEach('setup contract for each test', async () => {
    bounty = await Bounty.new();
  });

  it('creates bounty', async () => {
    await bounty.createBounty(1, 1, {from: alice});
    const response = await bounty.listMyBounties.call({from: alice});
    assert.equal(response.length, 1);
    assert.equal(response[0], 1);
  });

  it('lists bounties when none', async () => {
    const response = await bounty.listMyBounties.call({from: alice});
    assert.equal(response.length, 0);
  });

  it('creates submission', async () => {
    await bounty.createSubmission(1, 1, {from: alice});
    const response = await bounty.listMySubmissions.call({from: alice});
    assert.equal(response.length, 1);
    assert.equal(response[0], 1);
  });

  it('accepts submission', async () => {
    const bountyId = 1;

    const initialAmount = 30;
    const bountyAmount = 3;

    const bobSubmissionId = 4;
    const charlieSubmissionId = 5;

    await bounty.approve(alice, initialAmount);
    await bounty.transfer(alice, initialAmount);

    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.createSubmission(bountyId, charlieSubmissionId, {from: charlie});

    const acceptResponse = await bounty.acceptSubmission.call(bobSubmissionId, {from: alice});
    assert.equal(true, acceptResponse);

    await bounty.acceptSubmission(bobSubmissionId, {from: alice});

    const listResponse = await bounty.listBountySubmissions.call(bountyId, {from: alice});
    assert.equal(2, listResponse.length);
    assert.equal(bobSubmissionId, listResponse[0].toNumber()); // bob's submission
    assert.equal(charlieSubmissionId, listResponse[1].toNumber()); // charlie's submission

    const bountyAcceptedSubmissionResponse = await bounty.getBountyAcceptedSubmission.call(1, {from: alice});
    assert.equal(bobSubmissionId, bountyAcceptedSubmissionResponse.toNumber()); // accepted submission

    assert.equal(initialAmount - bountyAmount, (await bounty.balanceOf(alice)).toNumber());
    assert.equal(bountyAmount, (await bounty.balanceOf(bob)).toNumber());
  });

  it('lists submissions when none', async () => {
    const response = await bounty.listMySubmissions.call({from: bounty.address});
    assert.equal(response.length, 0);
  });
});
