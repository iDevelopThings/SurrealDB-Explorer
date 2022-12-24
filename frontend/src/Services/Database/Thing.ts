import {SurrealSchema} from "surrealdb.schema";

type Split<S extends string, D extends string> =
	string extends S ? string[] :
		S extends "" ? [] :
			S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

export type ExtractThing<T extends string> = Split<T, ":">
export type ThingTable<T extends string> = ExtractThing<T>[0]
export type ThingId<T extends string> = ExtractThing<T>[1]

export class Thing<T extends string = any> {
	private _table: ThingTable<T>;
	private _id: ThingId<T>;

	constructor(thing: string);
	constructor(table: string, id: string);
	constructor(table: string, id?: string) {
		if (arguments.length === 1) {
			const [tbl, id] = table.split(":");
			this._table     = tbl;
			this._id        = id;
			return;
		}

		this._table = table;
		this._id    = id;
	}

	get table(): ThingTable<T> | string {
		return this._table;
	}

	get id(): ThingId<T> | string {
		return this._id;
	}

	get value(): `${ThingTable<T>}:${ThingId<T>}` | string {
		return `${this._table}:${this._id}`;
	}

	toString(): `${ThingTable<T>}:${ThingId<T>}` | string {
		return this.value;
	}

	public static looksLike(value: any): boolean {
		if (typeof value !== "string") {
			return false;
		}

		const schema = ((SurrealSchema as any)._instance as SurrealSchema).schema;
		if (!schema) {
			throw new Error("Schema not loaded");
		}


		if (!value.includes(":")) {
			return false;
		}

		const [table, id] = value.split(":");
		if (!schema.hasTable(table)) {
			return false;
		}


		return true;
	}
}


export function thing<T extends string>(id: T): Thing<T> {
	return new Thing(id);
}

type Constructor = new (...args: any[]) => {};
type GConstructor<T = {}> = new (...args: any[]) => T;

class RecordBase<T, TDataType> {
	_data: TDataType;

	constructor(...args: any[]) {
		this._data = args[0];
		Object.assign(this, args[0]);
	}

	public static create<T, TDataType>(this: GConstructor<T>, data: TDataType): T & TDataType {
		const inst = new (this as any)(data);
		Object.setPrototypeOf(inst, this.prototype);
		return inst;
	}

	get thing(): Thing {
		return thing(this._data["id"]);
	}

	get originalData(): TDataType {
		return this._data;
	}

	toString(): string {
		return this.thing.toString();
	}

}

type RecordType<T, TDataType> = {
	[P in keyof RecordBase<T, TDataType>]: RecordBase<T, TDataType>[P]
} & { [P in keyof TDataType]: TDataType[P] };

type RecordInst<T, TDataType> = {
	new(): RecordType<T, TDataType>;

	create<T, TDataType>(this: GConstructor<T>, data: TDataType): T;
}

export function Record<T, TDataType>() {
	const rType = RecordBase<T, TDataType>;
	return rType as unknown as RecordInst<T, TDataType>;
}
