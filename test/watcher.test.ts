import EventEmitter from "events";

import { TestScheduler } from "./scheduler.test";
import { IWatcher } from "../src/watcher";
import { SeasonScheduleJob } from "../src/scheduler";

export function watcherTests({
	                             scheduler,
	                             watcher,
	                             seasonScheduledEmitter,
	                             seasonStatusChangedEmitter
                             }: {
	scheduler: TestScheduler,
	watcher: IWatcher,
	seasonScheduledEmitter: EventEmitter,
	seasonStatusChangedEmitter: EventEmitter
}) {
	describe('watchForEvents', () => {
		it('correctly subscribes to events', () => {
			const events = {
				seasonScheduled: () => seasonScheduledEmitter,
				seasonStatusChanged: () => seasonStatusChangedEmitter
			};

			watcher.watchForEvents(events);

			expect(seasonScheduledEmitter.listenerCount('data')).toBe(1);
			expect(seasonStatusChangedEmitter.listenerCount('data')).toBe(1);
		});

		it('correctly schedules season start when seasonScheduleEmitter emits event', async () => {
			// TODO DRY
			const seasonStartHandler = jest.fn();
			const seasonFinishHandler = jest.fn();

			const n = new Date();
			const curr = new Date().getTime();
			n.setSeconds(n.getSeconds() + 30);

			scheduler.currentTimestamp = curr;
			scheduler.setHandlers({
				seasonStart: seasonStartHandler,
				seasonFinish: seasonFinishHandler,
			});

			seasonScheduledEmitter.emit('data', {
				returnValues: {
					startDate: n.getTime(),
					duration: n.getTime() - curr
				}
			});

			// wait for the event to be added to jobs by TestScheduler
			await new Promise(res => {
				setTimeout(() => res(''), 2000);

				jest.advanceTimersToNextTimer();
			});

			expect(scheduler.jobs.size).toBe(2);

			const jobs = [
				{
					name: SeasonScheduleJob.SeasonStart,
					mock: seasonStartHandler
				},
				{
					name: SeasonScheduleJob.SeasonFinish,
					mock: seasonFinishHandler
				}
			];

			jobs.forEach(({name, mock}) => {
				expect(scheduler.jobs.has(name)).toBeTruthy();
				expect(mock).not.toHaveBeenCalled();
			})

			jest.advanceTimersToNextTimer();
			expect(seasonStartHandler).toHaveBeenCalled();

			jest.advanceTimersToNextTimer();
			expect(seasonFinishHandler).toHaveBeenCalled();

			jobs.forEach(({name, mock}) => {
				const job = scheduler.jobs.get(name);
				expect(job).toHaveProperty('run')
				expect(job.run).toBeTruthy();
			})
		});
	});
}