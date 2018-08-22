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
    $('#addSubmissionForm').on('submit', App.handleAddSubmission);
    $(document).on('click', '.btn-bounty-details', App.handleGetBountyDetails);
    $(document).on('click', '.btn-add-submission', App.handleAddSubmissionClicked);
    $(document).on('click', '.btn-download-submission', App.handleGetSubmissionDowload);
  },

  initContract: function() {
    $.getJSON('contracts/Bounty.json', function(BountyArtifact) {
      App.contracts.Bounty = TruffleContract(BountyArtifact);
      App.contracts.Bounty.setProvider(App.web3Provider);
      App.getMyBounties();
      App.getMySubmissions();
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

  getMySubmissions: function() {
    var submissionRow = $('#submissionRow');
    var submissionTemplate = $('#submissionTemplate');
    App.contracts.Bounty.deployed().then(function(instance) {
      return App.withFirstAccount(function(account) {
        submissionRow.html('');
        instance.listMySubmissions.call({from: account}).then(function(submissions) {
          for (i = 0; i < submissions.length; i ++) {
            submissionTemplate.find('.panel-title').text(submissions[i]);
            submissionTemplate.find('.btn').attr('data-id', submissions[i]);

            submissionRow.append(submissionTemplate.html());
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
     cb(string);
    });
  },

  handleAddSubmissionClicked: function(e) {
    $('#addSubmissionModal').data('bounty-id', $(e.target).data('id'));
    $('#addSubmissionModal').modal('show');
  },

  handleGetBountyDetails: function(e) {
    e.preventDefault();
    var bountyId = $(e.target).data('id');

    App.ipfs.files.cat(App.hashFromBytes32(bountyId), function(err, res) {
      if (err) {
        console.log(err);
        return;
      }

      App.handleResponse(res, function(data) {
        var jsonData = JSON.parse(data);
        $('#bountyName').html(jsonData.name);
        $('#bountyAmount').html(jsonData.amount);
        $('#bountyDescription').html(jsonData.description);
        $('#bountyDetailsModal').modal('show');

        var submissionTemplate = $('#submissionRowTemplate');
        var submissionRow = $('#submissionTable');

        App.contracts.Bounty.deployed().then(function(instance) {
          return App.withFirstAccount(function(account) {
            return instance.getBountyAcceptedSubmission.call(bountyId, {from: account}).then(function(acceptedSubmission) {
              return instance.listBountySubmissions.call(bountyId, {from: account}).then(function(results) {
                submissionRow.html('');
                instance.listMySubmissions.call({from: account}).then(function(submissions) {
                  for (i = 0; i < submissions.length; i ++) {
                    if (acceptedSubmission != '0x0000000000000000000000000000000000000000000000000000000000000000') {
                      submissionTemplate.find('.btn-accept-submission').hide();
                      submissionTemplate.find('.btn-reject-submission').hide();
                    } else if (acceptedSubmission == submissions[i]) {
                      submissionTemplate.removeClass('.hidden');
                    }
                    submissionTemplate.find('.submission-id').html(submissions[i]);
                    submissionTemplate.find('.btn').attr('data-id', submissions[i]);

                    submissionRow.append(submissionTemplate.html());
                  }
                });
              });
            });
          });
        });
      });
    });
  },


  handleGetSubmissionDowload: function(e) {
    e.preventDefault();
    var bountyId = $(e.target).data('id');

    App.ipfs.files.cat(App.hashFromBytes32(bountyId), function(err, res) {
      if (err) {
        console.log(err);
        return;
      }

      App.handleResponse(res, function(data) {
        $('#submissionDownloadLink').attr('href', data.replace('data:;base64,', 'data:application/octet-stream;charset=utf-8;base64,'));
        $('#submissionDownloadModal').modal('show');
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
              App.getMySubmissions();
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
