import { Agenda } from "agenda/es";
import { Logger } from "log4js";
import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';

export interface IScheduler {
	scheduleSeason(startDate: string, duration: string, prizePool: string): Promise<any>;
}

export enum SeasonScheduleJob {
	SeasonStart = 'season-start',
	SeasonFinish = 'season-finish'
}

export class Scheduler implements IScheduler {
	#agenda: Agenda;
	#logger: Logger;
	#methods: { [p: string]: ContractSendMethod };
	#web3: Web3;
	#address: string;

	constructor(
			logger: Logger,
			agenda: Agenda,
			web3: Web3,
			{address}: { address: string },
			contractMethods: {
				[name: string]: ContractSendMethod
			}) {
		this.#logger = logger;
		this.#methods = contractMethods;
		this.#web3 = web3;
		this.#address = address;
		this.#agenda = agenda;
	}

	async scheduleSeason(startDate: string, duration: string, prizePool: string): Promise<void> {
		// since Solidity primarily operates with seconds, startDate and duration will be in seconds also
		const start = new Date(+startDate * 1000);
		const finish = new Date(+startDate * 1000);
		finish.setSeconds(finish.getSeconds() + +duration);

		const jobs = [
			{
				name: SeasonScheduleJob.SeasonStart,
				when: start
			},
			{
				name: SeasonScheduleJob.SeasonFinish,
				when: finish
			}
		];

		try {
			await this.registerJobs(jobs);
		} catch (err) {
			// todo retry
			this.#logger.error("Error registering season jobs");
			return;
		}

		this.#logger.info("Season start and finish jobs have been successfully scheduled");
	}

	async registerJobs(jobs: Array<any>): Promise<void> {
		jobs.forEach(({name}) => this.#agenda.define(name, async () => {
			let method;

			switch (name) {
				case SeasonScheduleJob.SeasonStart:
					method = 'startSeason';
					break;
				case SeasonScheduleJob.SeasonFinish:
					method = 'stopSeason';
					break;
				default:
					break;
			}

			try {
				const m = this.#methods[method];
				const gasPrice = await this.#web3.eth.getGasPrice();
				const gasEstimate = await m.estimateGas({from: this.#address});

				const tx = await m.send({
					from: this.#address,
					gasPrice,
					gas: gasEstimate,
				});

				this.#logger.debug(`${name} tx number:`, {tx});
			} catch (err) {
				this.#logger.error('error: ', {err});
			}
		}))

		await this.#agenda.start();

		await Promise.all(jobs.map(async ({name, when}) => this.#agenda.schedule(when, name, null)));
	}
}