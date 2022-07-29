import dotenv from 'dotenv';
import path from 'path';

let file;

switch (process.env.NODE_ENV) {
	case 'prod':
		file = '.env.prod';
		break;
	case 'test':
		file = '.env.test';
		break;
	case 'dev':
	default:
		file = '.env.dev'
		break;
}

dotenv.config({
	path: path.join(__dirname, '../../', file)
});

export interface Config {
	prizePoolContractAddress: string;
	trustedSeasonSignerPrivKey: string;
	providerWsUrl: string;
	isProd: boolean;
	logger: {
		level: string;
	}
	mongodb: { url: string }
}

export function getConfig(): Config {
	return Object.freeze({
		trustedSeasonSignerPrivKey: process.env.TRUSTED_SIGNER_PRIV_KEY,
		providerWsUrl: process.env.PROVIDER_WS_URL,
		prizePoolContractAddress: process.env.CONTRACT_ADDRESS,
		logger: {
			level: process.env.LOG_LEVEL
		},
		isProd: process.env.NODE_ENV === 'prod',
		mongodb: {url: process.env.MONGO_DB_URL}
	})
}




