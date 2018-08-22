 /* eslint no-var: 0 */
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    App.ipfs = window.IpfsApi('localhost', '5001');
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    web3 = new Web3(App.web3Provider);
    App.initContract();
    App.bindEvents();
  },

  byte32FromHash: function(hash) {
    return `0x${require('bs58').decode(hash).slice(2).toString('hex')}`;
  },

  withFirstAccount: function(cb) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      return cb(accounts[0]);
    });
  },

  bindEvents: function() {
    $('#addBountyForm').on('submit', App.handleAddBounty);
  },

  initContract: function() {
    $.getJSON('contracts/Bounty.json', function(BountyArtifact) {
      App.contracts.Bounty = TruffleContract(BountyArtifact);
      App.contracts.Bounty.setProvider(App.web3Provider);
      return App.getMyBounties();
    });
  },

  getMyBounties: function() {
    var bountyRow = $('#bountyRow');
    var bountyTemplate = $('#bountyTemplate');
    console.log('called getMyBounties');
    App.contracts.Bounty.deployed().then(function(instance) {
      return App.withFirstAccount(function(account) {
        bountyRow.html('');
        instance.listMyBounties.call({from: account}).then(function(bounties) {
          for (i = 0; i < bounties.length; i ++) {
            bountyTemplate.find('.panel-title').text(bounties[i]);
            bountyTemplate.find('.btn-accept').attr('data-id', bounties[i]);

            bountyRow.append(bountyTemplate.html());
          }
        });
      });
    });
  },

  handleAccept: function(event) {
    event.preventDefault();
    var submissionId = parseInt($(event.target).data('id'));

    App.contracts.Bounty.deployed().then(function(instance) {
      return App.withFirstAccount(function(account) {
        return instance.acceptSubmission(submissionId, {from: account}).then(function(result) {
          // todo: accepted submission
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    });
  },

  handleAddBounty: function(e) {
    e.preventDefault();
    var data = $(e.target).serializeArray().reduce((obj, item) => {
      obj[item.name] = item.value;
      return obj;
    }, {});

    App.ipfs.files.add(window.IpfsApi().Buffer.from(JSON.stringify(data)), function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      App.contracts.Bounty.deployed().then(function(instance) {
        return App.withFirstAccount(function(account) {
          var byte32 = App.byte32FromHash(res[0].hash);
          console.log(byte32);
          console.log(data);
          return instance.createBounty(byte32, parseInt(data.amount), {from: account, gas: 3000000}).then(function(result) {
            return App.getMyBounties();
          }).catch(function(err) {
            console.log(err.message);
          });
        });
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
