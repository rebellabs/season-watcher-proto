import EventEmitter from 'events';
import { Watcher } from "../src/watcher";

import { TestScheduler, schedulerTests } from "./scheduler.test";
import { watcherTests } from "./watcher.test";
import log4js from "log4js";

const logger = log4js.getLogger();

const seasonScheduledEmitter = new EventEmitter();
const seasonStatusChangedEmitter = new EventEmitter();
const scheduler = new TestScheduler(seasonStatusChangedEmitter);
const watcher = new Watcher(logger, scheduler);

jest.useFakeTimers();

describe('Scheduler', () => {
	afterAll(() => {
		scheduler.resetJobs();
	});

	schedulerTests({
		scheduler
	});
});

describe('Watcher', () => {
	watcherTests({
		watcher,
		scheduler,
		seasonStatusChangedEmitter,
		seasonScheduledEmitter
	})
})