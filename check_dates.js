const Web3 = require('web3');
const artifacts = require('./build/contracts/Voting.json');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

async function check() {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = artifacts.networks[networkId];
    if (!deployedNetwork) {
        console.log("Not deployed");
        return;
    }
    const contract = new web3.eth.Contract(artifacts.abi, deployedNetwork.address);
    const dates = await contract.methods.getDates().call();
    console.log("Start:", dates[0]);
    console.log("End:", dates[1]);
    
    const count = await contract.methods.countCandidates().call();
    console.log("Candidates:", count);
    
    const accounts = await web3.eth.getAccounts();
    const hasVoted = await contract.methods.voters(accounts[0]).call();
    console.log("Has Account 0 Voted:", hasVoted);
}

check().catch(console.error);
