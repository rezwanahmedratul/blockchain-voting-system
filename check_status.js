module.exports = async function(callback) {
  try {
    const Voting = artifacts.require("Voting");
    const instance = await Voting.deployed();
    const start = await instance.votingStart();
    const end = await instance.votingEnd();
    const now = Math.floor(Date.now() / 1000);
    const block = await web3.eth.getBlock('latest');
    const blockTime = block.timestamp;
    
    console.log("Start timestamp:", start.toString());
    console.log("End timestamp:", end.toString());
    console.log("System timestamp:", now);
    console.log("Block timestamp:", blockTime);
    
    if (blockTime >= start && blockTime < end) {
      console.log("Election IS active (block time)");
    } else {
      console.log("Election is NOT active (block time)");
    }
  } catch (err) {
    console.error(err);
  }
  callback();
}
