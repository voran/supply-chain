const Bounty = artifacts.require('./Bounty.sol');
contract('Bounty', ([owner, alice, bob, charlie]) => {
  let bounty;

  beforeEach('setup contract for each test', async () => {
    bounty = await Bounty.new();
  });

  //it('creates bounty', async () => {
  //  console.log(owner);
  //  await bounty.createBounty.call(1, 1, {from: owner});
  //});

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
    await bounty.createBounty(1, 3, {from: alice});
    await bounty.createSubmission.call(1, 2, {from: bob});
    await bounty.createSubmission(1, 2, {from: bob});
    await bounty.createSubmission(1, 3, {from: charlie});

    const acceptResponse = await bounty.acceptSubmission.call(2, {from: alice});
    assert.equal(true, acceptResponse);

    await bounty.acceptSubmission(2, {from: alice});
    const listResponse = await bounty.listBountySubmissions.call(1, {from: alice});
    assert.equal(2, listResponse.length);
    assert.equal(2, listResponse[0].toNumber()); // bob's submission
    assert.equal(3, listResponse[1].toNumber()); // charlie's submission

    const bountyAcceptedSubmissionResponse = await bounty.getBountyAcceptedSubmission.call(1, {from: alice});
    assert.equal(2, bountyAcceptedSubmissionResponse.toNumber()); // accepted submission
  });

  it('lists submissions when none', async () => {
    const response = await bounty.listMySubmissions.call({from: alice});
    assert.equal(response.length, 0);
  });
});
