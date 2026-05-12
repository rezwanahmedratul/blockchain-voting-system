//import "../css/style.css"

const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts)


window.App = {
  ensureToastContainer: function() {
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },

  showToast: function(message, type = 'info') {
    App.ensureToastContainer();
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3800);
  },

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
                  if (!nameCandidate || !partyCandidate) {
                    App.showToast("Please enter both candidate name and party.", "warning");
                    return;
                  }
                 instance.addCandidate(nameCandidate,partyCandidate).then(function(result){ 
                   App.showToast("Candidate added successfully.", "success");
                   setTimeout(() => location.reload(), 800);
                 }).catch(function(err){
                   console.error("Error adding candidate:", err);
                   App.showToast("Failed to add candidate. Please try again.", "error");
                 });

            });   
              $('#addDate').click(function(){             
                  var startDate = Date.parse(document.getElementById("startDate").value)/1000;

                  var endDate =  Date.parse(document.getElementById("endDate").value)/1000;

                  if (isNaN(startDate) || isNaN(endDate)) {
                    App.showToast("Please select both start and end dates.", "warning");
                    return;
                  }
           
                  instance.setDates(startDate,endDate).then(function(rslt){ 
                    App.showToast("Voting dates set successfully.", "success");
                    setTimeout(() => location.reload(), 800);
                  }).catch(function(err){
                    console.error("Error setting dates:", err);
                    App.showToast("Failed to set dates. Make sure dates haven't been set already and are valid.", "error");
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
        
        var totalCandidates = countCandidates.toNumber ? countCandidates.toNumber() : Number(countCandidates);
        let candidatesProcessed = 0;
        let displayedIndex = 1; // Sequential index for UI

        // Handle case where there are no candidates
        if (totalCandidates === 0) {
          App.renderChart();
        }

        for (var i = 0; i < totalCandidates; i++ ){
          instance.getCandidate(i+1).then(function(data){
            var id = data[0];
            var name = data[1];
            var party = data[2];
            var voteCount = data[3];
            var isActive = data[4];

            // Convert BigNumber to plain number for Chart.js
            var voteNum = voteCount.toNumber ? voteCount.toNumber() : Number(voteCount);
            
            if (isActive) {
              var viewCandidates = `<tr>
                <td><input class="form-check-input" type="radio" name="candidate" value="${id}" id="candidate-${id}"></td>
                <td><label for="candidate-${id}">${name}</label></td>
                <td>${party}</td>
                <td class="text-center"><strong>${voteNum}</strong></td>
              </tr>`;
              $("#boxCandidate").append(viewCandidates);
              
              var adminCandidateRow = `<tr>
                <td>${displayedIndex++}</td>
                <td>${name}</td>
                <td>${party}</td>
                <td>${voteNum}</td>
                <td><button class="btn btn-danger btn-sm" onclick="App.deleteCandidate(${id})">Delete</button></td>
              </tr>`;
              $("#adminCandidateList").append(adminCandidateRow);

              window.candidateNames.push(name);
              window.candidateVotes.push(voteNum);
            }
            
            candidatesProcessed++;
            // Render chart once ALL candidates have been processed
            if (candidatesProcessed === totalCandidates) {
              App.renderChart();
            }
          });
        }
        
        window.countCandidates = countCandidates 
      });

      // Synchronize dates check and vote status
      instance.getDates().then(function(result){
        var startTs = result[0].toNumber ? result[0].toNumber() : Number(result[0]);
        var endTs = result[1].toNumber ? result[1].toNumber() : Number(result[1]);
        var startDate = new Date(startTs * 1000);
        var endDate = new Date(endTs * 1000);
        var now = new Date();
        var votingActive = false;

        if (startTs === 0) {
          $("#dates").text("Not Scheduled");
        } else {
          $("#dates").text(startDate.toLocaleString() + " - " + endDate.toLocaleString());
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
                let msgText = "Election not active";
                if (startTs !== 0) {
                  if (now < startDate) msgText = "Election has not started yet";
                  else if (now > endDate) msgText = "Election has ended";
                }
                $("#msg").html("<span class='account-pill' style='background: var(--danger); color: var(--on-primary);'>" + msgText + "</span>");
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
      App.showToast("Please vote for a candidate.", "warning");
      return
    }
    VotingContract.deployed().then(function(instance){
      instance.vote(parseInt(candidateID)).then(function(result){
        $("#voteButton").attr("disabled", true);
        $("#msg").html("<p>Voted</p>");
        App.showToast("Vote cast successfully!", "success");
        setTimeout(() => window.location.reload(1), 800);
      }).catch(function(err){ 
        console.error("ERROR! " + err.message)
        App.showToast("Voting failed. Please try again.", "error");
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
      App.showToast("Voting failed. Please try again.", "error");
    })
  },

  renderChart: function() {
    const ctx = document.getElementById('voteChart');
    if (!ctx) return;
    
    // Destroy previous chart instance if it exists
    if (window.myVoteChart) {
      window.myVoteChart.destroy();
      window.myVoteChart = null;
    }

    var names = window.candidateNames || [];
    var votes = window.candidateVotes || [];

    // If no data, show an empty state
    if (names.length === 0) {
      window.myVoteChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['No candidates yet'],
          datasets: [{
            label: 'Number of Votes',
            data: [0],
            backgroundColor: 'rgba(103, 80, 164, 0.15)',
            borderColor: 'rgba(103, 80, 164, 0.3)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
      return;
    }

    // Generate colors based on Material You palette
    var bgColors = [];
    var borderColors = [];
    var palette = [
      { bg: 'rgba(103, 80, 164, 0.25)', border: 'rgba(103, 80, 164, 1)' },
      { bg: 'rgba(125, 82, 96, 0.25)', border: 'rgba(125, 82, 96, 1)' },
      { bg: 'rgba(0, 128, 96, 0.25)', border: 'rgba(0, 128, 96, 1)' },
      { bg: 'rgba(33, 150, 243, 0.25)', border: 'rgba(33, 150, 243, 1)' },
      { bg: 'rgba(255, 152, 0, 0.25)', border: 'rgba(255, 152, 0, 1)' },
      { bg: 'rgba(156, 39, 176, 0.25)', border: 'rgba(156, 39, 176, 1)' },
    ];
    for (var i = 0; i < names.length; i++) {
      var c = palette[i % palette.length];
      bgColors.push(c.bg);
      borderColors.push(c.border);
    }
    
    window.myVoteChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Number of Votes',
          data: votes,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8
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
        App.showToast("Candidate deleted successfully.", "success");
        setTimeout(() => location.reload(), 800);
      }).catch(function(err){
        console.error("ERROR! " + err.message)
        App.showToast("Failed to delete candidate.", "error");
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
      App.showToast("Failed to delete candidate.", "error");
    })
  },

  loadVoters: function() {
    fetch('https://call.ratul.fun/voters')
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
    })
    .catch(function(err) {
      console.error("Error loading voters:", err);
    });
  },

  deleteVoter: function(voter_id) {
    if(!confirm(`Are you sure you want to delete voter ${voter_id}?`)) return;
    fetch(`https://call.ratul.fun/voters/${voter_id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        App.showToast("Voter deleted successfully.", "success");
        App.loadVoters();
      } else {
        App.showToast("Failed to delete voter.", "error");
      }
    })
    .catch(err => {
      console.error("Delete voter error:", err);
      App.showToast("Failed to delete voter.", "error");
    });
  },

  changePassword: function() {
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
      App.showToast("Please enter a new password", "warning");
      return;
    }

    // Extract voter_id from current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authHeader = urlParams.get('Authorization');
    if (!authHeader) {
      App.showToast("Session error. Please log in again.", "error");
      return;
    }

    var token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }

    const decoded = App.parseJwt(token);
    if (!decoded || !decoded.voter_id) {
      App.showToast("Invalid session. Please log in again.", "error");
      return;
    }

    const voter_id = decoded.voter_id;

    fetch('https://call.ratul.fun/change-password', {
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
        App.showToast("Password updated successfully!", "success");
        document.getElementById('newPassword').value = '';
      } else {
        App.showToast("Failed to update password.", "error");
      }
    })
    .catch(err => {
      console.error("Password change error:", err);
      App.showToast("An error occurred.", "error");
    });
  },

  resetElection: function() {
    if (!confirm("CRITICAL WARNING: This will permanently reset all vote counts and allow all users to vote again. Proceed?")) return;
    if (!confirm("FINAL CONFIRMATION: Are you absolutely sure?")) return;

    VotingContract.deployed().then(function(instance){
      instance.resetElection({from: App.account, gas: 500000}).then(function(result){
        App.showToast("Election cycle reset successfully. A new round has begun!", "success");
        setTimeout(() => location.reload(), 800);
      }).catch(function(err){
        console.error("Reset election error:", err);
        App.showToast("Failed to reset election: " + (err.message || "Unknown error"), "error");
      });
    }).catch(function(err){
      console.error("Reset election error:", err);
      App.showToast("Failed to reset election: " + (err.message || "Unknown error"), "error");
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
      var token;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
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
    // Page title mapping for each section
    var pageTitles = {
      '#dashboard': window.location.pathname.includes('admin.html') ? 'Admin Overview' : 'Voter Dashboard',
      '#voting': 'Cast Your Vote',
      '#results': 'Live Results',
      '#settings': 'Account Settings',
      '#candidates': 'Candidate Management',
      '#voters': 'Voter Management',
      '#timeline': 'Election Timeline'
    };

    // Smooth scroll navigation - all sections remain visible
    $('.nav-item').on('click', function(e) {
      var href = $(this).attr('href');
      
      // Logout link - don't intercept
      if (href === '#') return;
      
      e.preventDefault();
      
      // Update active nav link
      $('.nav-item').removeClass('active');
      $(this).addClass('active');
      
      // Update page title
      var title = pageTitles[href] || 'Dashboard';
      $('#pageTitle').text(title);
      
      // If this is the "Dashboard" or "Overview" link, scroll to top
      if (href === '#dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Scroll to the target section smoothly
      var target = $(href);
      if (target.length) {
        var headerOffset = 90; // account for fixed header
        var elementPosition = target[0].getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });

    // Handle hash in URL (e.g., from profile circle click)
    if (window.location.hash && window.location.hash !== '#') {
      var hash = window.location.hash;
      setTimeout(function() {
        var target = $(hash);
        if (target.length) {
          var headerOffset = 90;
          var elementPosition = target[0].getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          // Update active nav
          $('.nav-item').removeClass('active');
          $('.nav-item[href="' + hash + '"]').addClass('active');
          var title = pageTitles[hash] || 'Dashboard';
          $('#pageTitle').text(title);
        }
      }, 500);
    }
  },

  logout: function() {
    window.location.replace('/');
  }
}

window.addEventListener("load", function() {
  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask")
    window.eth = new Web3(window.ethereum)
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for deployment. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    window.eth = new Web3(new Web3.providers.HttpProvider("https://voterpc.ratul.fun"))
  }
  window.App.eventStart()
})
