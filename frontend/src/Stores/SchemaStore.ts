import {Store, OnInit, AfterAll, Computed} from "@idevelopthings/vue-class-stores/vue";
import {SurrealSchema, Schema, SchemaTable, type SurrealDbConfig, type JsonSchema} from "surrealdb.schema";
import {languages} from "monaco-editor";


interface ISchemaStore {
	loading: boolean;
	surrealSchema: SurrealSchema;
	schema: Schema,
	tables: SchemaTable[];
}

class SchemaStore extends Store<SchemaStore, ISchemaStore>() {

	public jsonSchemaResult: JsonSchema;
	public jsonSchema: languages.json.DiagnosticsOptions["schemas"] = null;

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

		this.$schema = await sschema.getSchema({
			generateId                       : true,
			deleteOriginalNestedObjectFields : true,
			handleNestedObjects              : true,
			removeArrayChildren              : true,
		});

		if (!this.jsonSchemaResult) {
			this.jsonSchemaResult = await sschema.getJsonSchema();

			const schemas = [];
			if (this.jsonSchemaResult) {
				for (let $defsKey in this.jsonSchemaResult.schema.$defs) {

					const schemaClone = {...this.jsonSchemaResult.schema.$defs[$defsKey] as any};
					delete schemaClone.$id;

					schemas.push({
						uri       : `json-schema://${$defsKey}`,
						fileMatch : ["*"],
						schema    : schemaClone,
					});
				}
			}

			this.jsonSchema = schemas;

		}

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
