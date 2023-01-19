import {Store, OnInit, AfterAll, Computed} from "@idevelopthings/vue-class-stores/vue";
import {SurrealSchema, Schema, SchemaTable, type SurrealDbConfig} from "surrealdb.schema";


interface ISchemaStore {
	loading: boolean;
	surrealSchema: SurrealSchema;
	schema: Schema,
	tables: SchemaTable[];
}

class SchemaStore extends Store<SchemaStore, ISchemaStore>() {

	get state(): ISchemaStore {
		return {
			loading       : true,
			surrealSchema : null,
			schema        : {} as Schema,

			tables : [],
		};
	}


	async loadSchema(config: SurrealDbConfig) {
		this.$loading = true;

		const sschema = SurrealSchema.init(config);

		this.$schema  = await sschema.getSchema({
			generateId                       : true,
			deleteOriginalNestedObjectFields : true,
			handleNestedObjects              : true,
		});

		this.$tables  = Object.values(this.$schema.tables);
		this.$loading = false;
	}

	get isLoading() {
		return this.state.loading;
	}

	get schema() {
		return this.state.schema;
	}

	get tables() {
		return this.state.tables;
	}

}

export const schemaStore = new SchemaStore();
