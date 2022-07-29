import EventEmitter from "events";
import { Logger } from "log4js";
import { EventOptions } from 'web3-eth-contract';

import { IScheduler } from "./scheduler";

enum SeasonStatuses {
	Active,
	Claim,
	Inactive,
	Scheduled
}

type Events<Options = EventOptions> = {
	[event: string]: (options: Options) => EventEmitter;
}

export interface IWatcher {
	watchForEvents(events: Events): void;
}

export class Watcher implements IWatcher {
	#scheduler: IScheduler;
	#logger: Logger;

	constructor(logger: Logger, scheduler: IScheduler) {
		this.#logger = logger;
		this.#scheduler = scheduler;
	}

	watchForEvents(events: Events): void {
		this.watchForSeasonScheduled(events.seasonScheduled);
		this.watchForStatusChanged(events.seasonStatusChanged);

		this.#logger.info("Watching for events:", Object.keys(events));
	}

	private watchForSeasonScheduled(seasonScheduled: any): void {
		seasonScheduled()
				.on('data', async ({returnValues: {startDate, duration, prizePool}}) => {
					this.#logger.info('seasonScheduled triggered', {startDate, duration, prizePool});
					await this.#scheduler.scheduleSeason(startDate, duration, prizePool);
				})
				.on('error', console.error); // todo
	}

	private watchForStatusChanged(seasonStatusChanged: any): void {
		seasonStatusChanged()
				.on('data', async ({returnValues: {status, ts}}) => {
							switch (status) {
								case SeasonStatuses.Claim:
									break
								case SeasonStatuses.Active:
									break
								case SeasonStatuses.Inactive:
									break
								case SeasonStatuses.Scheduled:
									break
							}
						}
				)
				.on('error', console.error); // todo
	}
}
