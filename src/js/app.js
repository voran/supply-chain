App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  withFirstAccount: function(cb) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      return cb(accounts[0]);
    });
  },

  initWeb3: function() {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Bounty.json', function(BountyArtifact) {
      App.contracts.Bounty = TruffleContract(BountyArtifact);
      App.contracts.Bounty.setProvider(App.web3Provider);
      return App.getMyBounties();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-accept', App.handleAccept);
    $(document).on('click', '.btn-add-bounty', App.handleAddBounty);
  },

  getMyBounties: function() {
    var bountyRow = $('#petsRow');
    var bountyTemplate = $('#petTemplate');
    console.log('called getMyBounties');
    App.contracts.Bounty.deployed().then(function(instance) {
      return App.withFirstAccount(function(account) {
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

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Bounty.deployed().then(function(instance) {
        return App.withFirstAccount(function(account) {
          return instance.acceptSubmission(submissionId, {from: account});
        });
      }).then(function(result) {
        // todo: accepted submission
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleAddBounty: function(event) {
    event.preventDefault();

    var bountyId = 2;
    var price = 10;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      console.log(accounts);

      App.contracts.Bounty.deployed().then(function(instance) {
        return instance.createBounty(bountyId, price, {from: accounts[0], gas: 3000000});
      }).then(function(result) {
        return App.getMyBounties();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
