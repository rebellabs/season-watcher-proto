import log4js, { Logger } from "log4js";
import { Config } from "./config";

log4js.configure({
	appenders: {
		out: {type: "stdout"},
		app: {type: "file", filename: "application.log"},
	},
	categories: {
		default: {appenders: ["out"], level: "debug"},
		app: {appenders: ["app"], level: "trace"}
	},
});

export function getLogger(config: Config): Logger {
	return log4js.getLogger(config.isProd ? 'app' : 'out');
}
