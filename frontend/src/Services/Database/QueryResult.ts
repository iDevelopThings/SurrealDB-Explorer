import {Surreal} from "@idevelopthings/surrealdb-client-ts";

type QResult<T> = {
	result: T,
	status: string,
	time: string,

	error?: Error,
}

type QuerySpeedTypes = "slow" | "med" | "fast";

type QResults<T> = QResult<T>[];

const intervals: [string, (t: number) => number][] = [
	["µs", t => t / 1000],
	["ms", t => t],
	["s", t => t * 1000],
	["m", t => t * 60000],
];

export class QueryResult<T = any> {
	private _query: string;
	private _params: any;

	private _result: QResults<T>;

	private _itemCount: number = 0;
	private _time: { unit: any; timeMs: number, formatted: string, speedType: QuerySpeedTypes };

	private _item: T;
	private _items: T[];
	private _jsonValue: string;

	private _failed: boolean = false;
	private _error: Error    = null;

	private _timeout: any = null;

	public static timeoutInterval = 10000;

	constructor(query: string, params: any) {
		this._query  = query;
		this._params = params;
	}

	async execute() {

		await new Promise(async (resolve, reject) => {
			let handled = false;

			this._timeout = setTimeout(() => {
				this._failed = true;
				this._error  = new Error("Query timed out.");

				handled = true;
				resolve(false);
			}, QueryResult.timeoutInterval);

			try {
				this._result = await Surreal.Instance.query(this._query, this._params);

				clearTimeout(this._timeout);

				if (handled) {
					return;
				}
				this.processResult();
			} catch (error) {
				this._error  = error;
				this._failed = true;
			}

			resolve(true);
		});

		return this;
	}

	get failed() {
		return this._failed;
	}

	get error(): Error {
		return this._error;
	}

	get errorFormatted() {
		if (!this._error) {
			return undefined;
		}

		let message = this._error.message;

		if (message.startsWith("Error:")) {
			message = message.slice(6);
		}

		if (message.startsWith("There was a problem with the database: ")) {
			message = message.slice(38);
		}

		return message;
	}

	firstQueryResult(): QResult<T> {
		return this._result[0];
	}

	get get() {
		return this._items;
	}

	get jsonValue() {
		if (this._jsonValue) return this._jsonValue;

		return this._jsonValue = JSON.stringify(this._result);
	}

	get first() {
		if (this._item) {
			return this._item;
		}

		return this._items[0];
	}

	private processResult(): void {
		let result = this.firstQueryResult();

		if (result.error) {
			this._failed = true;
			this._error  = result.error;
			return;
		}

		if (result.status === "OK") {
			if (result.result instanceof Array) {
				this._items     = result.result;
				this._itemCount = result.result.length;
			} else {
				this._item      = result.result;
				this._itemCount = 1;
			}

			this.processTimeTaken(result.time);
		}
	}

	get isSelect() {
		return this._query.toUpperCase().startsWith("SELECT");
	}

	get rawResult() {
		return this._result;
	}

	get itemCount() {
		return this._itemCount;
	}

	get timeTaken() {
		return this._time?.formatted;
	}

	get isSlow() {
		return this._time?.speedType === "slow";
	}

	get isMedium() {
		return this._time?.speedType === "med";
	}

	get isFast() {
		return this._time?.speedType === "fast";
	}

	private processTimeTaken(time: string): void {
		if (!time) return undefined;

		let timeMs = 0;
		let unit   = null;
		let speedType: QuerySpeedTypes;

		for (const [u, convert] of intervals) {
			if (time.endsWith(u)) {
				unit   = u;
				timeMs = convert(parseFloat(time.slice(0, -u.length)));
				break;
			}
		}

		if (timeMs > 2000) {
			speedType = "slow";
		} else if (timeMs > 1000 && timeMs <= 2000) {
			speedType = "med";
		} else {
			speedType = "fast";
		}


		this._time = {
			timeMs,
			unit,
			speedType,
			formatted : parseFloat(time.replace(unit, "")).toFixed(2) + " " + unit
		};
	}
}
