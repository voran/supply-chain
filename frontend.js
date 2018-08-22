 /* eslint no-var: 0 */
App = {
  web3Provider: null,
  contracts: {},
  bs58: require('bs58'),

  init: function() {
    App.ipfs = window.IpfsApi('localhost', '5001');
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    web3 = new Web3(App.web3Provider);
    App.initContract();
    App.bindEvents();
  },

  bytes32FromHash: function(hash) {
    return `0x${App.bs58.decode(hash).slice(2).toString('hex')}`;
  },

  hashFromBytes32: function(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    var hashHex = '1220' + bytes32Hex.slice(2);
    var hashBytes = window.IpfsApi().Buffer.from(hashHex, 'hex');
    var hashStr = App.bs58.encode(hashBytes);
    return hashStr;
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
    $(document).on('click', '.btn-bounty-details', App.handleGetBountyDetails);
    $(document).on('click', '.btn-add-submission', App.handleAddSubmissionClicked);
    $('#addSubmissionForm').on('submit', App.handleAddSubmission);
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
    App.contracts.Bounty.deployed().then(function(instance) {
      return App.withFirstAccount(function(account) {
        bountyRow.html('');
        instance.listMyBounties.call({from: account}).then(function(bounties) {
          for (i = 0; i < bounties.length; i ++) {
            bountyTemplate.find('.panel-title').text(bounties[i]);
            bountyTemplate.find('.btn').attr('data-id', bounties[i]);

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
          var bountyId = App.bytes32FromHash(res[0].hash);
          return instance.createBounty(bountyId, parseInt(data.amount), {from: account, gas: 3000000}).then(function(result) {
            return App.getMyBounties();
          }).catch(function(err) {
            console.log(err.message);
          });
        });
      });
    });
  },

  handleResponse: function(res, cb) {
    var string = '';
    res.on('data', function(buff) {
      var part = buff.toString();
      string += part;
      console.log('stream data ' + part);
    });

    res.on('end', function() {
     cb(JSON.parse(string));
    });
  },

  handleAddSubmissionClicked: function(e) {
    $('#addSubmissionModal').data('bounty-id', $(e.target).data('id'));
    $('#addSubmissionModal').modal('show');
  },

  handleGetBountyDetails: function(e) {
    e.preventDefault();
    var bytes = $(e.target).data('id');

    App.ipfs.files.cat(App.hashFromBytes32(bytes), function(err, res) {
      if (err) {
        console.log(err);
        return;
      }

      App.handleResponse(res, function(data) {
        $('#bountyName').html(data.name);
        $('#bountyAmount').html(data.amount);
        $('#bountyDescription').html(data.description);
        $('#bountyDetailsModal').modal('show');
      });
    });
  },

  handleSubmissionFileChanged: function(e) {
    reader = new FileReader();
    reader.readAsDataURL();
    console.log(e.target.files);
  },

  handleAddSubmission: function(e) {
    e.preventDefault();
    var files = $('#submissionFile')[0].files;
    var bountyId = $('#addSubmissionModal').data('bounty-id');
    if (files.length != 1) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      App.ipfs.files.add(window.IpfsApi().Buffer.from(e.target.result), function(err, res) {
        if (err) {
          console.log(err);
          return;
        }
        App.contracts.Bounty.deployed().then(function(instance) {
          return App.withFirstAccount(function(account) {
            var submissionId = App.bytes32FromHash(res[0].hash);
            return instance.createSubmission(bountyId, submissionId, {from: account, gas: 3000000}).then(function(result) {
              $('#addSubmissionModal').modal('hide');
              return;
            }).catch(function(err) {
              console.log(err);
            });
          });
        });
      });
    };


    reader.readAsDataURL(files[0]);
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
