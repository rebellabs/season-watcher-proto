import Web3 from "web3";
import { Contract } from "web3-eth-contract";

import { getAbi } from "../utils/abi";
import { Config } from "./config";

export function getBlockchainInfo(config: Config): { address: string; contract: Contract; web3: Web3 } {
	const web3 = new Web3(new Web3.providers.WebsocketProvider(config.providerWsUrl));

	const account = web3.eth.accounts.privateKeyToAccount(config.trustedSeasonSignerPrivKey);
	web3.eth.accounts.wallet.add(account);

	return {
		contract: new web3.eth.Contract(getAbi(), config.prizePoolContractAddress),
		address: account.address,
		web3,
	};
}
