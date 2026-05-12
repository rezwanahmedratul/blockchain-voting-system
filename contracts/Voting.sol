pragma solidity ^0.5.15;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party; 
        uint voteCount;
        bool isActive;
    }

    mapping (uint => Candidate) public candidates;
    // Track voters per election cycle: electionId => voterAddress => voted
    mapping (uint => mapping (address => bool)) public voters;

    uint public countCandidates;
    uint256 public votingEnd;
    uint256 public votingStart;
    uint public electionId;

    function addCandidate(string memory name, string memory party) public returns(uint) {
        countCandidates ++;
        candidates[countCandidates] = Candidate(countCandidates, name, party, 0, true);
        return countCandidates;
    }

    function deleteCandidate(uint candidateID) public {
        require(candidateID > 0 && candidateID <= countCandidates);
        candidates[candidateID].isActive = false;
    }

    function resetElection() public {
        electionId++;
        // Reset vote counts for all candidates
        for (uint i = 1; i <= countCandidates; i++) {
            candidates[i].voteCount = 0;
        }
        // Reset dates
        votingStart = 0;
        votingEnd = 0;
    }
   
    function vote(uint candidateID) public {
        require((votingStart <= now) && (votingEnd > now));
        require(candidateID > 0 && candidateID <= countCandidates);
        require(candidates[candidateID].isActive == true);
        require(!voters[electionId][msg.sender]);
               
        voters[electionId][msg.sender] = true;
        candidates[candidateID].voteCount ++;      
    }
    
    function checkVote() public view returns(bool){
        return voters[electionId][msg.sender];
    }
       
    function getCountCandidates() public view returns(uint) {
        return countCandidates;
    }

    function getCandidate(uint candidateID) public view returns (uint, string memory, string memory, uint, bool) {
        return (
            candidateID,
            candidates[candidateID].name,
            candidates[candidateID].party,
            candidates[candidateID].voteCount,
            candidates[candidateID].isActive
        );
    }

    function setDates(uint256 _startDate, uint256 _endDate) public{
        require((votingEnd == 0) && (votingStart == 0) && (_startDate + 1000000 > now) && (_endDate > _startDate));
        votingEnd = _endDate;
        votingStart = _startDate;
    }

    function getDates() public view returns (uint256, uint256) {
        return (votingStart, votingEnd);
    }
}
