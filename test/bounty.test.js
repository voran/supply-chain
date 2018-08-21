const Bounty = artifacts.require('./Bounty.sol');
contract('Bounty', ([owner, alice, bob]) => {
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

  it('lists submissions when none', async () => {
    const response = await bounty.listMySubmissions.call({from: alice});
    assert.equal(response.length, 0);
  });
});
