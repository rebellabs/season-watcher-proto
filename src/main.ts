import { Watcher } from "./watcher";
import { Scheduler } from "./scheduler";

import { getLogger } from "./loaders/logger";
import { getConfig } from "./loaders/config";
import { getAgenda } from "./loaders/agenda";
import { getBlockchainInfo } from "./loaders/contract";

(async () => {
	const config = getConfig();

	const logger = getLogger(config);

	const {contract, address, web3} = getBlockchainInfo(config);

	const {agenda, error} = await getAgenda(config);

	if (error) {
		logger.error('Error starting agenda');
		process.exit(0);
	}

	const seasonScheduler = new Scheduler(logger, agenda, web3, {address}, {
		startSeason: contract.methods.startSeason(),
		stopSeason: contract.methods.stopSeason(),
		getSeasonStartDate: contract.methods.getSeasonStartDate(),
	});

	const {
		SeasonScheduled: seasonScheduled,
		SeasonStatusChanged: seasonStatusChanged
	} = contract.events;
	const watcher = new Watcher(logger, seasonScheduler);

	watcher.watchForEvents({
		seasonScheduled,
		seasonStatusChanged
	});

	process.on('SIGINT', async () => {
		logger.debug("CTR-C: Shutting down...");

		process.exit(0);
	});
})()

