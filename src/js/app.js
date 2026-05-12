//import "../css/style.css"

const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts)


window.App = {
  eventStart: async function() { 
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    VotingContract.setProvider(window.ethereum)
    VotingContract.defaults({from: accounts[0],gas:6654755})

    // Load account data
    App.account = accounts[0];
    $("#accountAddress").html("Your Account: " + accounts[0]);
    
    // Initialize Theme & Navigation
    App.initTheme();
    App.initNavigation();

    VotingContract.deployed().then(function(instance){
     instance.getCountCandidates().then(function(countCandidates){

            $(document).ready(function(){
              $('#addCandidate').click(function() {
                  var nameCandidate = $('#name').val();
                  var partyCandidate = $('#party').val();
                 instance.addCandidate(nameCandidate,partyCandidate).then(function(result){ 
                   location.reload();
                 })

            });   
              $('#addDate').click(function(){             
                  var startDate = Date.parse(document.getElementById("startDate").value)/1000;

                  var endDate =  Date.parse(document.getElementById("endDate").value)/1000;
           
                  instance.setDates(startDate,endDate).then(function(rslt){ 
                    console.log("Dates set successfully");
                    location.reload();
                  });
              });     

              // We'll handle dates later to ensure synchronization with voting status

              // Load voters if on admin page
              if (window.location.pathname.includes('admin.html')) {
                App.loadVoters();
              }
          });
             
        window.candidateNames = [];
        window.candidateVotes = [];
        
        let candidatesProcessed = 0;
        let displayedIndex = 1; // Sequential index for UI
        for (var i = 0; i < countCandidates; i++ ){
          instance.getCandidate(i+1).then(function(data){
            var id = data[0];
            var name = data[1];
            var party = data[2];
            var voteCount = data[3];
            var isActive = data[4];
            
            if (isActive) {
              var viewCandidates = `<tr>
                <td><input class="form-check-input" type="radio" name="candidate" value="${id}" id="candidate-${id}"></td>
                <td><label for="candidate-${id}">${name}</label></td>
                <td>${party}</td>
                <td class="text-center"><strong>${voteCount}</strong></td>
              </tr>`;
              $("#boxCandidate").append(viewCandidates);
              
              var adminCandidateRow = `<tr>
                <td>${displayedIndex++}</td>
                <td>${name}</td>
                <td>${party}</td>
                <td>${voteCount}</td>
                <td><button class="btn btn-danger btn-sm" onclick="App.deleteCandidate(${id})">Delete</button></td>
              </tr>`;
              $("#adminCandidateList").append(adminCandidateRow);

              window.candidateNames.push(name);
              window.candidateVotes.push(voteCount);
            }
            
            candidatesProcessed++;
            // We do NOT call renderChart here directly, it will be called by initNavigation when the tab is shown
          });
        }
        
        window.countCandidates = countCandidates 
      });

      // Synchronize dates check and vote status
      instance.getDates().then(function(result){
        var startTs = result[0].toNumber();
        var endTs = result[1].toNumber();
        var startDate = new Date(startTs * 1000);
        var endDate = new Date(endTs * 1000);
        var now = new Date();
        var votingActive = false;

        if (startTs === 0) {
          $("#dates").text("Not Scheduled");
        } else {
          $("#dates").text(startDate.toDateString() + " - " + endDate.toDateString());
          if (now >= startDate && now <= endDate) {
            votingActive = true;
          }
        }

        instance.checkVote().then(function (voted) {
            if(!voted)  {
              if (votingActive) {
                $("#voteButton").attr("disabled", false);
                $("#voteButton").addClass("btn-pulse");
              } else {
                $("#msg").html("<span class='account-pill' style='background: #f4d2d2; color: #d82c0d; border: 1px solid #ffb3b3;'>Election not active</span>");
              }
            } else {
              $("#msg").html("<span class='account-pill'>You have already voted</span>");
              $("#voteButton").removeClass("btn-pulse");
            }
        });
      }).catch(function(err){ 
        console.error("ERROR retrieving dates! " + err.message)
      });

      // Load Profile Info
      App.loadProfile();

    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  vote: function() {    
    var candidateID = $("input[name='candidate']:checked").val();
    if (!candidateID) {
      $("#msg").html("<p>Please vote for a candidate.</p>")
      return
    }
    VotingContract.deployed().then(function(instance){
      instance.vote(parseInt(candidateID)).then(function(result){
        $("#voteButton").attr("disabled", true);
        $("#msg").html("<p>Voted</p>");
         window.location.reload(1);
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  renderChart: function() {
    const ctx = document.getElementById('voteChart');
    if (!ctx) return;
    
    // Destroy previous chart instance if it exists
    if (window.myVoteChart) {
      window.myVoteChart.destroy();
    }
    
    window.myVoteChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: window.candidateNames,
        datasets: [{
          label: 'Number of Votes',
          data: window.candidateVotes,
          backgroundColor: 'rgba(0, 128, 96, 0.2)',
          borderColor: 'rgba(0, 128, 96, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  },

  deleteCandidate: function(id) {
    if(!confirm("Are you sure you want to delete this candidate?")) return;
    VotingContract.deployed().then(function(instance){
      instance.deleteCandidate(id).then(function(result){
        alert("Candidate deleted successfully");
        location.reload();
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  loadVoters: function() {
    fetch('http://10.0.0.99:8000/voters')
    .then(response => response.json())
    .then(voters => {
      $("#voterList").empty();
      let voterIndex = 1;
      voters.forEach(voter => {
        let deleteBtn = voter.role === 'admin' ? 
          '<span class="account-pill">System Admin</span>' : 
          `<button class="btn btn-danger btn-sm" onclick="App.deleteVoter('${voter.voter_id}')">Delete</button>`;
          
        var row = `<tr>
          <td>${voterIndex++}. ${voter.voter_id}</td>
          <td>${voter.role}</td>
          <td>${deleteBtn}</td>
        </tr>`;
        $("#voterList").append(row);
      });
    });
  },

  deleteVoter: function(voter_id) {
    if(!confirm(`Are you sure you want to delete voter ${voter_id}?`)) return;
    fetch(`http://10.0.0.99:8000/voters/${voter_id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        alert("Voter deleted successfully");
        App.loadVoters();
      }
    });
  },

  changePassword: function() {
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }

    // Extract voter_id from current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authHeader = urlParams.get('Authorization');
    if (!authHeader) {
      alert("Session error. Please log in again.");
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = App.parseJwt(token);
    if (!decoded || !decoded.voter_id) {
      alert("Invalid session. Please log in again.");
      return;
    }

    const voter_id = decoded.voter_id;

    fetch('http://10.0.0.99:8000/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voter_id: voter_id,
        new_password: newPassword
      })
    })
    .then(response => {
      if (response.ok) {
        alert("Password updated successfully!");
        document.getElementById('newPassword').value = '';
      } else {
        alert("Failed to update password.");
      }
    })
    .catch(err => {
      console.error("Password change error:", err);
      alert("An error occurred.");
    });
  },

  resetElection: function() {
    if (!confirm("CRITICAL WARNING: This will permanently reset all vote counts and allow all users to vote again. Proceed?")) return;
    if (!confirm("FINAL CONFIRMATION: Are you absolutely sure?")) return;

    VotingContract.deployed().then(function(instance){
      instance.resetElection().then(function(result){
        alert("Election cycle reset successfully. A new round has begun!");
        location.reload();
      });
    }).catch(function(err){
      console.error("Reset election error:", err);
      alert("Failed to reset election.");
    });
  },

  initTheme: function() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    $("#themeBtn").text(theme === 'dark' ? '☀️' : '🌙');
  },

  toggleTheme: function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    $("#themeBtn").text(newTheme === 'dark' ? '☀️' : '🌙');
  },

  loadProfile: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authHeader = urlParams.get('Authorization');
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      if (token) {
        const decoded = App.parseJwt(token);
        if (decoded && decoded.voter_id) {
          const initial = decoded.voter_id.charAt(0).toUpperCase();
          $("#profileInitials").text(initial);
        }
      }
    }
  },

  parseJwt: function (token) {
    try {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  },

  initNavigation: function() {
    $('.nav-item').on('click', function(e) {
      if ($(this).attr('href') === '#') return; // Logout link
      e.preventDefault();
      
      // Update active nav link
      $('.nav-item').removeClass('active');
      $(this).addClass('active');
      
      // Get target section ID
      const targetId = $(this).attr('href');
      
      // Hide all sections, show target
      $('main section').addClass('hidden');
      $(targetId).removeClass('hidden');
      
      // If showing results/dashboard, render chart
      if (targetId === '#results' || targetId === '#dashboard') {
        App.renderChart();
      }
    });
    
    // Hide all sections except the first one initially
    $('main section').addClass('hidden');
    $('main section:first').removeClass('hidden');
  },

  logout: function() {
    if (confirm("Are you sure you want to logout?")) {
      window.location.href = '/login.html';
    }
  }
}

window.addEventListener("load", function() {
  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask")
    window.eth = new Web3(window.ethereum)
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for deployment. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    window.eth = new Web3(new Web3.providers.HttpProvider("http://voterpc.ratul.fun"))
  }
  window.App.eventStart()
})
