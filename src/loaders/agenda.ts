import { Agenda } from 'agenda/es';
import { Config } from "./config";

export async function getAgenda(config: Config): Promise<{ agenda: Agenda, error: boolean }> {
	const agenda = new Agenda({
		db: {address: config.mongodb.url}
	});
	let error;

	try {
		await new Promise((res, rej) => {
			agenda
					.once('ready', () => res(null))
					.on('error', () => rej());
		});
	} catch (err) {
		error = true;
	}

	return {
		error,
		agenda
	}
}