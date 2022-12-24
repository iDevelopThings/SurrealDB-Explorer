import {SchemaTable, SchemaField} from "surrealdb.schema";
import {reactive} from "vue";
import db from "../Services/Database/Database";
import {Thing} from "../Services/Database/Thing";
import {AsyncHandler, Async} from "../Services/AsyncProcessor";

export type EntryViewerInfo = {
	id: Thing | null;
	value: any;
	open: boolean;
	loading: boolean;
}
export type TableFilter = {
	field: string,
	operator: string,
	value: any,
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

	public entries: any[];

	public inputFilter: TableFilter = {
		field    : "id",
		operator : "=",
		value    : "",
	};
	public filters: TableFilter[]   = [];
	public showFilters: boolean     = false;

	public entryViewer: EntryViewerInfo = {
		id      : null,
		value   : null,
		open    : false,
		loading : false,
	};

	private loadOptions: LoadEntriesOptions;

	public selection: TableSelectionData = {
		ids         : [],
		isSelecting : false
	};

	constructor(table: SchemaTable) {
		this.schema       = table;
		this.recordFields = table.getFields().filter(f => f.name === "id" || f.record !== undefined);
		this.fields       = this.sortFields(table.getFields());
	}

	public deleteProcessor: AsyncHandler = Async(() => {
		return this.deleteItems();
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

		if (key === "id") {
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
			const result     = await db.query<{ total: number }>(`select count() as total from ${this.schema.name} group by id;`);
			const totalItems = result.first?.total ?? 0;
			this.totalRows   = totalItems;
			this.totalPages  = Math.ceil(totalItems / options.perPageLimit);
			this.loadedMeta  = true;
		}

		const offset = (this.page - 1) * options.perPageLimit;

		let querySegments = [
			`SELECT * FROM ${this.schema.name}`,
		];
		if (this.filters.length) {
			querySegments.push(`WHERE ${this.filters.map(f => `${f.field} ${f.operator} ${f.value}`).join(" AND ")}`);
		}

		if (offset > 0) {
			querySegments.push(`START ${offset}`);
		}

		querySegments.push(`LIMIT ${options.perPageLimit};`);

		const query = querySegments.join(" ");
		/*let query         = `SELECT * FROM ${this.schema.name} LIMIT ${options.perPageLimit}`;
		if (offset > 0) {
			query += ` START ${offset}`;
		}*/

		const result = await db.query<any>(query);
		let entries  = result.get;

		// We need to recursively iterate over all records, and check for fields which are
		// records, if they're a record, we'll change the value to `new Thing(value)`

		entries = entries.map(entry => this.processEntry(entry));

		this.entries = entries;

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

		const item = this.entries?.find(e => e.id === id.toString());
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

	public addFilter() {
		this.filters.push(this.inputFilter);
		this.inputFilter = {
			field    : "",
			operator : "=",
			value    : "",
		};

		this.refresh();
	}

	public removeFilter(idx) {
		this.filters.splice(idx, 1);

		if (this.filters.length) {
			this.refresh();
		}
	}

	public async createNewEntry(value: any) {
		const result = await db.create(this.schema.name, value);

		console.log("Result > ", result);

		this.entries.unshift(this.processEntry(result));

		return result;
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

	public async deleteItems(id?: any) {
		const ids = [];

		if (this.selection.isSelecting && !id) {
			ids.push(...this.selection.ids);
		} else {
			ids.push(id);
		}

		if (!ids.length) return;

		let query = [];
		for (const id of ids) {
			query.push(`DELETE ${id};`);
		}

		const result = await db.query(query.join("\n"));

		if (result.failed) {
			console.error("Failed to delete items: ", result.error);
			return;
		}

		this.entries = this.entries.filter(e => !ids.includes(e.id));

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
}


export type LoadEntriesOptions = {
	perPageLimit?: number;
}
