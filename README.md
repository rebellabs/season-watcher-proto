# Season Watcher Server MVP

## Prequisites 

In order to run the server yourself locally, you will need the following tools installed:

- Mongodb ([Install page](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/))
- Ganache ([Install page](https://trufflesuite.com/ganache/))

## Usage 

In order to run this prototype, we will compile our current contract code, deploy it on a local testnet chain, and see how the season watcher interacts with it.

First, start up the default mongodb instance (```brew services start mongodb-community@6.0``` via brew services, for instance). Next, we need to start a local blockchain with Ganache. Open the Ganache app, and open a new Ethereum workspace, no detailed configuration needed. You will see the list of available mock accounts with their balances, the blockchain should be initiated empty, on the block 0. 

Navigate to the [contract repository](https://github.com/rebellabs/prize-pool-proto.git). First of all, run ```yarn install```, then run:

```
yarn hardhat compile
yarn hardhat run scripts/deploy.js --network localhost
```

This should compile and deploy our contract on the local testnet. If succesful, you will see the **address of the contract** and the **deployer address** in your terminal. We will need both of them to configure season watcher appropiately. You can check the contract deployed succesfully by checking the latest block in Ganache app or by inspecting the transactions menu. 

Before you can run the watcher server, go to .env.dev and paste the contract address in the correcsponding field. In order to get your trusted signer private key, check the deployer address in the terminal, fin this address in the list of Ganahce addresses (usually should be the first address) and copy its private key. Then paste this to .env.dev too. 

Also paste these values in the script in the contract repository, located at 'scripts/schedule-test.js'. Private key in line 17, and deployed contract address in line 22. This will be necessary to easily send test transaction to the contract.

Finally, we can now spin up the watcher. In the root directory run:

```
yarn install
yarn run start:dev
```

You should then see the messages from the watcher in the termininal

## Test Request

Now return to the schedule-test.js script on contract repo. It allows us to demonstrate server-contract communication by sending a request to schedule a season to the deployed contract. Navigate back to contract repository root dir and run:

```
yarn hardhat run scripts/schedule-test.js --network localhost
```

You will see the transaction info in the current terminal window. In the watcher server you should see that the season was scheduled. In about 10 seconds, the scheduler will actually start the season, and it will finish it on time in another 10 seconds.

## How it currently works

The server is configured to listen to events emitted by a specific contract. In the beggining, schedule-test.js script uses the deployer (owner) private key to send a request to schedule the season, for a given timestamp in the future, with a given duration and so on. Server pick up the event, and it knows the start date and duration. The server then monitors the time, an when the start time is finally here it will send another transtaction to the contract actually starting the season. Same thing with ending the season - time is monitored by the server which then sends the transaction. 

You can inspect the list of transations and events in the Ganache GUI app. 