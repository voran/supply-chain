const Bounty = artifacts.require('./Bounty.sol');

const aliceBalance = 10;
const bobBalance = 20;

const bountyAmount = 3;


contract('Bounty', ([owner, alice, bob, charlie]) => {
  let bounty;

  beforeEach('setup contract for each test', async () => {
    bounty = await Bounty.new();
    await bounty.transfer(alice, aliceBalance);
    await bounty.transfer(bob, bobBalance);
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

    const bobSubmissionId = 4;
    const charlieSubmissionId = 5;

    assert.equal(true, await bounty.createBounty.call(bountyId, bountyAmount, {from: alice}));
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    assert.equal(aliceBalance - bountyAmount, (await bounty.balanceOf(alice)).toNumber());

    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.createSubmission(bountyId, charlieSubmissionId, {from: charlie});

    assert.equal(true, await bounty.acceptSubmission.call(bobSubmissionId, {from: alice}));
    await bounty.acceptSubmission(bobSubmissionId, {from: alice});

    const listResponse = await bounty.listBountySubmissions.call(bountyId, {from: alice});
    assert.equal(2, listResponse.length);
    assert.equal(bobSubmissionId, listResponse[0].toNumber()); // bob's submission
    assert.equal(charlieSubmissionId, listResponse[1].toNumber()); // charlie's submission

    const bountyAcceptedSubmissionResponse = await bounty.getBountyAcceptedSubmission.call(1, {from: alice});
    assert.equal(bobSubmissionId, bountyAcceptedSubmissionResponse.toNumber()); // accepted submission

    assert.equal(bobBalance + bountyAmount, (await bounty.balanceOf(bob)).toNumber());
  });

  it('lists submissions when none', async () => {
    const response = await bounty.listMySubmissions.call({from: bounty.address});
    assert.equal(response.length, 0);
  });
});
