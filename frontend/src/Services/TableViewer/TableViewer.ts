import {SchemaTable, SchemaField} from "surrealdb.schema";
import {reactive} from "vue";
import db from "../Database/Database";
import {Thing, thing} from "../Database/Thing";
import {AsyncHandler, Async} from "../AsyncProcessor";
import {QueryResult} from "../Database/QueryResult";
import type {EventBusKey} from "@vueuse/core";
import {useEventBus} from "@vueuse/core";
import {TableFilters} from "@/Services/TableViewer/TableFilters";

export const tablesOnErrorKey: EventBusKey<{ name: string, error: IErrorMessageSections }> = Symbol("eventBus:tables:error");

export const tablesErrorBus = useEventBus(tablesOnErrorKey);

export type EntryViewerInfo = {
	id: Thing | null;
	value: any;
	open: boolean;
	loading: boolean;
}

export type TableSelectionData = {
	ids: Thing[],
	isSelecting: boolean,
}

export class TableViewer {

	public loading: boolean = false;
	public schema: SchemaTable;

	public fields: SchemaField[];
	public recordFields: SchemaField[];

	public page: number       = 1;
	public totalPages: number = 1;
	public totalRows: number  = 1;

	public loadedMeta: boolean = false;

	private _entries = reactive({
		values : [],
	});

	public get entries() {
		return this._entries.values;
	}

	public filters: TableFilters = new TableFilters();

	public entryViewer: EntryViewerInfo = {
		id      : null,
		value   : null,
		open    : false,
		loading : false,
	};

	public loadOptions: LoadEntriesOptions;

	public selection: TableSelectionData = {
		ids         : [],
		isSelecting : false
	};

	public lastQueryResult: QueryResult<any> = null;

	constructor(table: SchemaTable) {
		this.schema       = table;
		this.recordFields = table.getFields().filter(f => f.name === "id" || f.record !== undefined);
		this.fields       = this.sortFields(table.getFields());
	}

	public deleteProcessor: AsyncHandler = Async((id?: any) => {
		return this.deleteItems(id);
	});

	public static create(table: SchemaTable) {
		return reactive(new TableViewer(table));
	}

	get title() {
		return this.schema?.title;
	}

	private sortFields(originalFields: SchemaField[]): SchemaField[] {
		const fields = originalFields
			.filter(f => f.isArrayChild === false)
			.sort((a, b) => a.name.localeCompare(b.name));

		const idField = fields.find(field => field.name === "id");
		if (idField) {
			fields.splice(fields.indexOf(idField), 1);
			fields.unshift(idField);
		}

		return fields;
	}

	private processValue(key: any, value: any, field?: SchemaField, parentField?: SchemaField) {
		field = field ?? this.schema.getField(key);

		const hasSchema = field === undefined || this.schema?.getFields()?.length === 0;

		if (key === "id" && Thing.looksLike(value)) {
			return new Thing(value);
		}

		if (value instanceof Thing) {
			return value;
		}

		if (!hasSchema) {
			if (Thing.looksLike(value)) {
				return new Thing(value);
			}
		} else {

			if (field?.isArrayChild) {
				if (parentField && field?.isRecord()) {
					return new Thing(value);
				}
			}

		}

		if (typeof value === "object") {
			if (Array.isArray(value)) {
				if (field?.type === "array" && field?.children?.length) {
//					console.log("Array field: ", key, value, "schema field: ", field);
					return value.map(v => this.processValue(
						key, v,
						field ? field.children[0] : undefined,
						field ? field : undefined
					));
				}

				return value.map(v => this.processValue(key, v));
			}

			for (const key in value) {
				value[key] = this.processValue(
					key, value[key],
					field ? field.children.find(f => f.name === key) : undefined,
					field
				);
			}

		}

		return value;
	}

	private processEntry(value: any) {
		const entry = {};

		for (const key in value) {
			entry[key] = this.processValue(key, value[key]);
		}

		return entry;
	}

	async loadEntries(options: LoadEntriesOptions) {
		this.loadOptions = options;
		this.loading     = true;

		if (!this.loadedMeta) {
			const result     = await db.query<number>(
				`select * from count((select id from ${this.schema.name}));`
			);
			this.totalRows   = result.first ?? 0;
			this.totalPages  = Math.ceil(this.totalRows / options.perPageLimit);
			this.loadedMeta  = true;
		}

		const offset = (this.page - 1) * options.perPageLimit;

		let querySegments = [`SELECT * FROM ${this.schema.name}`,];

		if (this.filters.has()) {
			querySegments.push(this.filters.getQuery());
		}

		querySegments.push(`LIMIT ${options.perPageLimit}`);
		querySegments.push(`START ${offset || 0}`);

		const result = await db.query<any>(querySegments.join(" ") + ";");

		console.log(result);
		this.lastQueryResult = result;

		if (result.failed) {
			tablesErrorBus.emit({name : this.schema.name, error : this.errorMessageSections});

			this.loading = false;
			return;
		}

		// We need to recursively iterate over all records, and check for fields which are
		// records, if they're a record, we'll change the value to `new Thing(value)`

		this._entries.values = result.get.map(entry => this.processEntry(entry));

		if (!this._entries.values?.length) {
			tablesErrorBus.emit({name : this.schema.name, error : this.errorMessageSections});
		}

		this.loading = false;
	}

	public refresh() {
		return this.loadEntries(this.loadOptions);
	}

	public get canGetPrev() {
		return this.page > 1;
	}

	public async prevPage() {
		if (!this.canGetPrev) return;

		this.page--;

		await this.loadEntries(this.loadOptions);
	}

	public get canGetNext() {
		return this.page < this.totalPages;
	}

	public async nextPage() {
		if (!this.canGetNext) return;

		this.page++;

		await this.loadEntries(this.loadOptions);
	}

	closeEntryViewer() {
		this.entryViewer.open  = false;
		this.entryViewer.value = null;
	}

	openEntryViewer(id: Thing) {
		this.entryViewer.id = id;

		const item = this._entries.values?.find(e => e.id === id.toString());
		if (item) {
			this.entryViewer.value = item;
			this.entryViewer.open  = true;
		} else {
			this.entryViewer.loading = true;
			db.query(`SELECT * FROM ${this.schema.name} WHERE id = ${id.toString()}`)
				.then(result => {
					if (result.failed) {
						console.error("Failed to load entry: ", result.error);
						return;
					}
					const item = result.first;
					if (item) {
						this.entryViewer.value   = this.processEntry(item);
						this.entryViewer.open    = true;
						this.entryViewer.loading = false;
					}
				});
		}

	}

	public async createNewEntry(value: any) {
		const result = await db.create(this.schema.name, value);

		this._entries.values.unshift(this.processEntry(result));

		return result;
	}

	public async updateEntry(id, jsonData: any) {
		const result = await db.updateSingle(id, jsonData);
		if (!result) {
			return;
		}

		const thingId = thing(id);

		const updated = await db.query(`SELECT * FROM type::thing('${thingId.table}', '${thingId.id}') LIMIT 1;`);

		if (updated.failed) {
			console.error("Failed to update entry: ", updated.error);
			return;
		}

		const entry = this._entries.values.find(e => e.id === id);

		if (entry) {
			Object.assign(entry, this.processEntry(updated.first));
		}

		return entry;
	}

	get isSelecting() {
		return this.selection.isSelecting;
	}

	public toggleSelecting() {
		if (this.selection.isSelecting) {
			this.selection.isSelecting = false;
			this.selection.ids         = [];
			return;
		}

		this.selection.isSelecting = true;
	}

	public isSelected(item: any) {
		return this.selection.ids.includes(item.id);
	}

	public async deleteItems(singleId?: any) {
		let ids = [];

		if (this.selection.isSelecting && !singleId) {
			ids.push(...this.selection.ids);
		} else {
			ids.push(singleId);
		}

		if (!ids.length) return;

		ids = ids.map(id => id.toString());

		let query = [];
		for (const id of ids) {
			query.push(`DELETE ${id};`);
		}

		const result = await db.query(query.join("\n"));

		if (result.failed) {
			console.error("Failed to delete items: ", result.error);
			return;
		}

		this._entries.values = this._entries.values.filter(e => !ids.includes(e.id.toString()));

		if (this.selection.isSelecting)
			this.toggleSelecting();


	}

	public select(item: any) {
		if (!this.selection.isSelecting) return;

		if (!item?.id) {
			throw new Error("Cannot select item without an ID. Item: ", item);
		}

		if (this.isSelected(item)) {
			this.selection.ids.splice(this.selection.ids.indexOf(item.id), 1);
			return;
		}
		this.selection.ids.push(item.id);
	}

	public get shouldShowError() {
		if (this.loading) return false;
		if (!this.lastQueryResult) return false;

		return this.lastQueryResult?.failed || !this._entries.values?.length;
	}

	public get errorMessageSections(): IErrorMessageSections {
		const sections: IErrorMessageSections = {
			hasError : false,
			title    : undefined,
			message  : undefined,
		};

		if (!this.shouldShowError) return sections;

		sections.hasError = true;

		if (this.lastQueryResult?.failed && this.lastQueryResult?.errorFormatted) {
			sections.title   = "Query Failure";
			sections.message = this.lastQueryResult?.errorFormatted;
		} else if (!this._entries.values?.length) {
			sections.title = "No Results";

			if (this.filters.hasAnyFilters()) {
				if (this.filters.invalidSegmentCount() > 0) {
					sections.title   = "Invalid Filter";
					sections.message = "Please double check your filter values, strings need to be wrapped in quotes.";
				} else {
					sections.message = "No results found for the current filter.";
				}
			} else {
				sections.message = "No results found.";
			}
		} else {
			sections.title   = "Unknown Error";
			sections.message = "An unknown error occurred. If this continues, please create an issue on the github repo.";
		}

		return sections;
	}


}

export type IErrorMessageSections = {
	hasError: boolean;

	title: string;
	message: string;
}


export type LoadEntriesOptions = {
	perPageLimit?: number;
}
