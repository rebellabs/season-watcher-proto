import { IScheduler, SeasonScheduleJob } from "../src/scheduler";
import EventEmitter from "events";

export class TestScheduler implements IScheduler {
	currentTimestamp: number;
	readonly #emitter: EventEmitter;
	#jobs: Map<string, { handler: Function, run?: boolean }> = new Map();
	#seasonStart: () => void;
	#seasonFinish: () => void;

	constructor(emitter: EventEmitter) {
		this.#emitter = emitter;
	}

	get emitter(): EventEmitter {
		return this.#emitter;
	}

	get jobs(): Map<string, any> {
		return this.#jobs;
	}

	resetJobs(): void {
		this.#jobs = new Map();
	}

	setHandlers({seasonStart, seasonFinish}: { seasonStart: () => void, seasonFinish: () => void }): void {
		this.#seasonStart = seasonStart;
		this.#seasonFinish = seasonFinish;
	}

	async scheduleSeason(startDate: string, duration: string, prizePool: string): Promise<void> {
		this.#jobs.set(SeasonScheduleJob.SeasonStart, {handler: this.#seasonStart})
		this.#jobs.set(SeasonScheduleJob.SeasonFinish, {handler: this.#seasonFinish});

		// schedule seasonStart to be run at startDate
		setTimeout(() => {
			this.#jobs.get(SeasonScheduleJob.SeasonStart).handler('start');
			this.#jobs.set(
					SeasonScheduleJob.SeasonStart,
					{...this.#jobs.get(SeasonScheduleJob.SeasonStart), run: true}
			);
		}, ((+startDate) - this.currentTimestamp));

		// schedule seasonFinish to be run at startDate + duration
		setTimeout(() => {
			this.#jobs.get(SeasonScheduleJob.SeasonFinish).handler('finish');
			this.#jobs.set(
					SeasonScheduleJob.SeasonFinish,
					{...this.#jobs.get(SeasonScheduleJob.SeasonFinish), run: true}
			);
		}, ((+startDate + +duration) - this.currentTimestamp));
	}
}

export function schedulerTests({
	                               scheduler
                               }) {
	describe('scheduleSeason', () => {
		const seasonStartHandler = jest.fn();
		const seasonFinishHandler = jest.fn();

		let startDate: number;
		let duration: number;

		beforeAll(() => {
			const n = new Date();
			const curr = new Date().getTime();
			n.setSeconds(n.getSeconds() + 30);
			startDate = n.getTime();
			duration = startDate - curr;

			scheduler.currentTimestamp = curr;
			scheduler.setHandlers({
				seasonStart: seasonStartHandler,
				seasonFinish: seasonFinishHandler,
			});
		});

		it('correctly schedules season start and finish dates', async () => {
			await scheduler.scheduleSeason(startDate, duration);

			expect(scheduler.jobs.size).toBe(2);
			expect(scheduler.jobs.get(SeasonScheduleJob.SeasonStart))

			scheduler.resetJobs();
		})

		describe('season handlers', () => {
			beforeAll(async () => {
				await scheduler.scheduleSeason(startDate, duration);
			})

			it('correctly calls startSeason function when it\'s time to start the season', async () => {
				jest.advanceTimersByTime(startDate - scheduler.currentTimestamp);

				expect(seasonStartHandler).toHaveBeenCalled();
			});

			it('finishSeason should not be called earlier then (startDate + duration) time period', () => {
				jest.advanceTimersByTime(duration - 1000); // season is active for one more second

				expect(seasonFinishHandler).toHaveBeenCalledTimes(0);
			})

			it('correctly calls finishSeason function when time has come', async () => {
				jest.advanceTimersByTime(1000); // advance by last second

				expect(seasonFinishHandler).toHaveBeenCalled();
			});
		})

	})
}