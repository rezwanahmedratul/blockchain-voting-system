const Web3 = require('web3');
const contract = require('@truffle/contract');
const artifacts = require('./build/contracts/Voting.json');

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
const VotingContract = contract(artifacts);
VotingContract.setProvider(provider);

async function run() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const instance = await VotingContract.deployed();
    try {
        await instance.resetElection({from: accounts[0], gas: 1000000});
        console.log("Success!");
    } catch(e) {
        console.error("Failed:", e.message);
    }
}
run();
