const Bounty = artifacts.require('./Bounty.sol');


contract('Bounty', ([owner, alice, bob, charlie]) => {
  let bounty;

  const bountyId ='0x0000000000000000000000000000000000000000000000000000000000000001';
  const revertMessage = 'VM Exception while processing transaction: revert';

  const bobSubmissionId = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const charlieSubmissionId = '0x0000000000000000000000000000000000000000000000000000000000000002';

  const aliceBalance = 10;
  const bobBalance = 20;

  beforeEach('setup contract for each test', async () => {
    bounty = await Bounty.new();
    await bounty.transfer(alice, aliceBalance);
    await bounty.transfer(bob, bobBalance);
  });

  it('happy case accepts submission', async () => {
    const bountyAmount = 3;

    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    assert.equal(aliceBalance - bountyAmount, (await bounty.balanceOf(alice)).toNumber());

    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.createSubmission(bountyId, charlieSubmissionId, {from: charlie});

    const listResponse = await bounty.listBountySubmissions.call(bountyId, {from: alice});
    assert.equal(2, listResponse.length);
    assert.equal(bobSubmissionId, listResponse[0]);
    assert.equal(charlieSubmissionId, listResponse[1]);

    const listMySubmissionsResponse = await bounty.listMySubmissions.call({from: bob});
    assert.equal(1, listMySubmissionsResponse.length);
    assert.equal(bobSubmissionId, listMySubmissionsResponse[0]);

    await bounty.acceptSubmission(bobSubmissionId, {from: alice});


    const bountyAcceptedSubmissionResponse = await bounty.getBountyAcceptedSubmission.call(bountyId, {from: alice});
    assert.equal(bobSubmissionId, bountyAcceptedSubmissionResponse);
    assert.equal(bobBalance + bountyAmount, (await bounty.balanceOf(bob)).toNumber());
  });

  it('does not create bounty on zero amount', async () => {
    const bountyAmount = 0;

    let err;
    try {
      await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not create bounty on insufficient balance', async () => {
    const bountyAmount = 200;

    let err;
    try {
      await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not create bounty on zero hash', async () => {
    const bountyAmount = 2;

    let err;
    try {
      await bounty.createBounty(0, bountyAmount, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not create submission on zero hash for bounty', async () => {
    let err;
    try {
      await bounty.createSubmission(0, bobSubmissionId, {from: bob});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not create submission on zero hash for submission', async () => {
    let err;
    try {
      await bounty.createSubmission(bountyId, 0, {from: bob});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not accept submission when not bounty owner', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});

    let err;
    try {
      await bounty.acceptSubmission(bobSubmissionId, {from: bob});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not accept submission when already accepted', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.acceptSubmission(bobSubmissionId, {from: alice});

    let err;
    try {
      await bounty.acceptSubmission(bobSubmissionId, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not accept submission when already rejected', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.rejectSubmission(bobSubmissionId, {from: alice});

    let err;
    try {
      await bounty.acceptSubmission(bobSubmissionId, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not reject submission when already accepted', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.acceptSubmission(bobSubmissionId, {from: alice});

    let err;
    try {
      await bounty.rejectSubmission(bobSubmissionId, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not reject submission when already rejected', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.rejectSubmission(bobSubmissionId, {from: alice});

    let err;
    try {
      await bounty.rejectSubmission(bobSubmissionId, {from: alice});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('does not accept submission when not bounty owner', async () => {
    const bountyAmount = 3;
    await bounty.createBounty(bountyId, bountyAmount, {from: alice});

    let err;
    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    try {
      await bounty.acceptSubmission(bobSubmissionId, {from: bob});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('rejects submission when bounty owner', async () => {
    const bountyAmount = 3;

    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    assert.equal(aliceBalance - bountyAmount, (await bounty.balanceOf(alice)).toNumber());

    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    await bounty.rejectSubmission(bobSubmissionId, {from: alice});

    const listResponse = await bounty.listBountyRejectedSubmissions.call(bountyId, {from: alice});
    assert.equal(1, listResponse.length);
    assert.equal(bobSubmissionId, listResponse[0]);
  });

  it('does not reject submission when not bounty owner', async () => {
    const bountyAmount = 3;

    await bounty.createBounty(bountyId, bountyAmount, {from: alice});
    assert.equal(aliceBalance - bountyAmount, (await bounty.balanceOf(alice)).toNumber());

    await bounty.createSubmission(bountyId, bobSubmissionId, {from: bob});
    let err;
    try {
      await bounty.rejectSubmission(bobSubmissionId, {from: charlie});
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
    assert.equal(err.message, revertMessage);
  });

  it('lists bounties when none', async () => {
    const response = await bounty.listBounties.call({from: alice});
    assert.equal(response.length, 0);
  });

  it('lists submissions when none', async () => {
    const response = await bounty.listMySubmissions.call({from: bounty.address});
    assert.equal(response.length, 0);
  });
});
