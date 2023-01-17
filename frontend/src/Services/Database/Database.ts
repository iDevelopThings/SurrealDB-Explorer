import Surreal, {type RootAuth} from "@idevelopthings/surrealdb-client-ts";
import {reactive, type UnwrapNestedRefs} from "vue";
import {QueryResult} from "./QueryResult";
import {type SurrealDbConfig} from "surrealdb.schema";
import {Thing} from "./Thing";

interface IDatabaseState {
	connected: boolean;
	config: SurrealDbConfig;
}

class Database {
	private state: UnwrapNestedRefs<IDatabaseState>;

	private database: Surreal = Surreal.Instance;

	constructor() {
		this.state = reactive<IDatabaseState>({
			connected : false,
			config    : null,
		});
	}

	get connected() {
		return this.state.connected;
	}

	connect(config: SurrealDbConfig) {
		if (this.connected) {
			return;
		}

		this.state.config = config;

		return new Promise((resolve, reject) => {
			const closeHandle = (error) => {
				console.error("Socket connection errored.");
				this.disconnect();
				reject(error);
			};

			this.database.once("close", closeHandle);

			this.database.connect(`${this.state.config.host}/rpc`)
				.then(() => this.database.signin(this.state.config as RootAuth))
				.then(() => this.database.use(this.state.config.namespace, this.state.config.database))
				.then(() => {
					this.state.connected = true;

					this.database.off("close", closeHandle);

					resolve(true);
				});
		});
	}

	async query<T = any>(
		query: string,
		vars?: Record<string, unknown>,
	): Promise<QueryResult<T>> {
		return new QueryResult<T>(query, vars).execute();
	}

	public async updateSingle<T = any>(thing: string, data: Partial<T>): Promise<T> {
		const response = await this.database.update(thing, data as any);
		return response || undefined;
	}

	public async changeSingle<T extends Record<string, unknown> = any>(thing: string, data: Partial<T>): Promise<T> {
		const response = await this.database.change<T>(thing, data as any);
		return response[0] || undefined;
	}

	public async create<T = any>(thing: string | Thing, data: T): Promise<T> {
		if (thing instanceof Thing) {
			thing = thing.value;
		}
		const result = await this.database.create(thing, data as any);

		return result as T;
	}

	public async httpRequest<T = any>(config: SurrealDbConfig, query: string) {
		const controller = new AbortController();

		const timeout = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(`${config.host}/sql`, {
			method  : "POST",
			headers : {
				"Authorization" : `Basic ${btoa(config.user + ":" + config.pass)}`,
				"Content-Type"  : "application/json",
				"Accept"        : "application/json",
				"NS"            : config.namespace,
				"DB"            : config.database,
			},
			body    : query,
			signal  : controller.signal,
		});

		clearTimeout(timeout);

		return await response.json() as T;
	}

	public disconnect(): void {
		this.state.connected = false;
		this.state.config    = null;
		if (!this.database.ws.closed)
			this.database.close();
	}
}

export {Database};
const db = new Database();
export default db;
