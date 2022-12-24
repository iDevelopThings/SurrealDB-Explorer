import Surreal from "surrealdb.js";

type QResult<T> = {
	result: T,
	status: string,
	time: string,

	error?: Error,
}

type QResults<T> = QResult<T>[];

export class QueryResult<T = any> {
	private _query: string;
	private _params: any;

	private _result: QResults<T>;

	private _item: T;
	private _items: T[];
	private _jsonValue: string;

	private _failed: boolean = false;
	private _error: Error    = null;

	constructor(query: string, params: any) {
		this._query  = query;
		this._params = params;
	}

	async execute() {
		try {
			this._result = await Surreal.Instance.query(this._query, this._params);

			this.processResult();
		} catch (error) {
			this._error  = error;
			this._failed = true;
		}

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
				this._items = result.result;
			} else {
				this._item = result.result;
			}
		}
	}
}
