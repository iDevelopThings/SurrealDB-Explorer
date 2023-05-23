import {LogError, LogInfo, LogDebug, LogTrace, LogWarning} from "../../wailsjs/runtime";

const loggerSymbol = Symbol("Logger");
class LoggerInstance {

	private originalMethods = {
		debug : console.debug,
		error : console.error,
		info  : console.info,
		log   : console.log,
		trace : console.trace,
		warn  : console.warn,
	}

	constructor() {
		console[loggerSymbol] = true;
	}

	public static patch() {
		if(console[loggerSymbol]) {
			return;
		}

		return (new this());
	}

	public error(...data: any[]) {
		this.originalMethods.error(...arguments);
		if(!window.runtime) return;
		LogError(data.join(" "));
	}

	public debug(...data: any[]) {
		this.originalMethods.debug(...arguments);
		if(!window.runtime) return;
		LogDebug(data.join(" "));
	}

	public info(...data: any[]) {
		this.originalMethods.info(...arguments);
		if(!window.runtime) return;
		LogInfo(data.join(" "));
	}

	public log(...data: any[]) {
		this.originalMethods.log(...arguments);
		if(!window.runtime) return;
		LogDebug(data.join(" "));
	}

	public trace(...data: any[]) {
		this.originalMethods.trace(...arguments);
		if(!window.runtime) return;
		LogTrace(data.join(" "));
	}

	public warn(...data: any[]) {
		this.originalMethods.warn(...arguments);
		LogWarning(data.join(" "));
	}
}
export const Logger = LoggerInstance.patch();
