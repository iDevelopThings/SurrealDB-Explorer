import {Store, On} from "@idevelopthings/vue-class-stores/vue";
import {SchemaTable, SchemaField} from "surrealdb.schema";
import {schemaStore} from "./SchemaStore";
import {Thing} from "@/Services/Database/Thing";
import {TableViewer, type IErrorMessageSections} from "@/Services/TableViewer/TableViewer";
import {Config} from "../../wailsjs/go/models";
import db from "../Services/Database/Database";
import {AsyncFunc, AsyncHandlerFunction} from "@/Services/AsyncProcessor";
import type { EventBusKey } from '@vueuse/core'

export const tablesOnErrorKey: EventBusKey<IErrorMessageSections> = Symbol('eventBus:tables');

export interface ViewTableProps {
	name: string,
	id?: Thing
}

interface ITableStore {
	loading: boolean;
	perPageLimit: number;
	tables: { [key: string]: TableViewer };
	current: string;
}

class TableStore extends Store<TableStore, ITableStore>() {

	get state(): ITableStore {
		return {
			loading      : false,
			perPageLimit : 25,
			tables       : {},
			current      : null,
		};
	}

	public tryLoad(params: ViewTableProps) {
		const tableName = params.name as string;
		const entryId   = params.id;

		if (this.state.loading) return;

		return this.load(schemaStore.$schema.getTable(tableName), entryId);
	}

	public createViewer(tableName: string) {
		const table = schemaStore.$schema.getTable(tableName);
		if (this.state.tables[table.name] === undefined) {
			this.state.tables[table.name] = TableViewer.create(table) as TableViewer;
		}
		return this.state.tables[table.name];
	}

	async load(table: SchemaTable, entryId?: Thing) {
		this.state.loading = true;

		const viewer = this.createViewer(table.name);

		this.state.current = table.name;

		await viewer.loadEntries({
			perPageLimit : this.state.perPageLimit,
		});

		this.state.loading = false;

		return viewer;
	}

	@On("connection:disconnect")
	private onDisconnect(data: { connection: Config.Connection }) {
		console.log("Disconnected from server", data);

		this.state.tables  = {};
		this.state.current = null;
	}

	getFieldValue<T = any>(field: SchemaField, entry: any): T {
		if (entry === null) return null;
		if (entry === undefined) return undefined;

		if (field.name === "id" && !(entry.id instanceof Thing)) {
			entry.id = new Thing(entry.id);
		}
		if (field.type.includes("record")) {
			if (field.isArrayChild) {
				return new Thing(entry) as any;
			} else if (!(entry[field.name] instanceof Thing)) {
				entry[field.name] = new Thing(entry[field.name]);
			}
		}

		if (Number.isInteger(entry)) {
			return entry;
		}

		// Check if entry is a string
		if (typeof entry === "string") {
			return entry as any;
		}

		return entry[field.name];
	}

	public sortEntryFields(entry: any) {
		const sortedKeys = Object.keys(entry).sort((a, b) => {
			if (a === "id") return -1;
			if (b === "id") return 1;

			return a.localeCompare(b);
		});

		const sortedEntry = {};
		for (const key of sortedKeys) {
			sortedEntry[key] = entry[key];
		}


		return sortedEntry;
	}

	public get(table: string): TableViewer {
		return this.createViewer(table);
	}

	public get viewer(): TableViewer {
		return this.get(this.state.current);
	}

	public viewEntry(id: Thing): void {
		const viewer = this.createViewer(id.table);

		viewer.openEntryViewer(id);
	}

	runQuery<T>(query: string, vars?: { [key: string]: any }): AsyncHandlerFunction<(query:string, vars: {[key:string]:any}) => T> {
		return AsyncFunc(async (handler, query: string, vars?: { [key: string]: any }) => {
			const result = await db.query<T>(query, vars);

			console.log("Query result", result);

			return result;
		});
	}

	public hasTables() {
		return Object.keys(this.state.tables).length > 0;
	}
}

export const tableStore = new TableStore();
