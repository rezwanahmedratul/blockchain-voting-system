const Web3 = require('web3');
const contract = require('@truffle/contract');
const artifacts = require('./build/contracts/Voting.json');

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
const VotingContract = contract(artifacts);
VotingContract.setProvider(provider);

async function run() {
    try {
        const instance = await VotingContract.deployed();
        const dates = await instance.getDates();
        console.log("Start timestamp:", dates[0].toString());
        console.log("End timestamp:", dates[1].toString());
        
        const now = Math.floor(Date.now() / 1000);
        console.log("Current timestamp:", now);
    } catch(e) {
        console.error("Failed:", e.message);
    }
}
run();
