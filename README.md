# Season Watcher Server MVP

The following tutorial

## Prequisites 

In order to run the server yourself locally, you will need the following tools installed:

- Mongodb ([Install page](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/))
- Ganache ([Install page](https://trufflesuite.com/ganache/))

## Usage 

In order ti run this prototype, we will compile our current contract code, deploy it on a local testnet chain, and see how the season watcher interacts with it.

First, start up the default mongodb instance (```brew services start mongodb-community@6.0```via brew services, for instance). Next, we need to start a local blockchain with Ganache. Open the Ganache app, and open a new Ethereum workspace, no detailed configuration needed. You will see the list of available mock accounts with their balances, the blockchain should be initiated empty, on the block 0. 

Navigate to the [contract repository](https://github.com/rebellabs/prize-pool-proto.git). First of all, run ```yarn install```, then run:

```
yarn hardhat compile
yarn hardhat run scripts/deploy.js --network localhost
```

This should compile and deploy our contract on the local testnet. If succesful, you will see the address of the contract and the deployer address in your terminal. We will need both of them to configure season watcher appropiately. 