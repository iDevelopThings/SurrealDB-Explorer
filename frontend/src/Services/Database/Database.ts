import {Surreal, ConnectionFlowResult} from "@idevelopthings/surrealdb-client-ts";
import {reactive, type UnwrapNestedRefs} from "vue";
import {QueryResult} from "./QueryResult";
import {type SurrealDbConfig} from "surrealdb.schema";
import {Thing} from "./Thing";
import {Config} from "../../../wailsjs/go/models";
import {defineEvent, event} from "vue-frontend-utils";

interface IDatabaseState {
	connection: Config.Connection;

	status: ConnectionFlowResult | null;
}

export const onLostConnection = defineEvent<any>("database:lost-connection");
export const onReconnected    = defineEvent<number>("database:reconnected");
export const onDisconnect     = defineEvent<Config.Connection>("database:disconnected");

//export const onReconnectAttempt = defineEvent<number>("database:reconnect-attempt");


class Database {
	public state: UnwrapNestedRefs<IDatabaseState>;

	private database: Surreal = Surreal.Instance;

	constructor() {
		this.state = reactive<IDatabaseState>({
			connection : null,
			status     : new ConnectionFlowResult(),
		});
	}

	async connect(connection: Config.Connection): Promise<ConnectionFlowResult> {
		if (this.database.isConnected()) {
			if (this.state.connection?.id === connection.id) {
				return;
			}

			this.disconnect();
		}

		this.state.connection = connection;

		this.database.configure({
			host : connection.host,
			auth : {
				user : connection.user,
				pass : connection.pass,
			},
			use  : {
				db : connection.database,
				ns : connection.namespace
			}
		});

		this.database.setReconnectPolicy({
			autoReconnect        : true,
			maxReconnectAttempts : 10,
			reconnectInterval    : 1000,
			maxReconnectInterval : 5000,
		});

		this.database.onConnectionEnd(() => this.onDisconnect());
		this.database.onLostConnection(() => onLostConnection.invoke());
		this.database.onReconnected((attempts) => onReconnected.invoke(attempts));

		this.state.status = await this.database.startConnectionFlow();

		console.log(this.state.status);

		return this.state.status as ConnectionFlowResult;
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
		this.database.onConnectionEnd(null);

		onDisconnect.invoke(this.state.connection);

		this.state.connection = null;
		this.database.close();
	}

	public onDisconnect() {
		this.disconnect();

		console.log("lost connection to db?");
	}

	public get status(): ConnectionFlowResult | null {
		return this.state.status as ConnectionFlowResult;
	}

}

export {Database};
const db = new Database();
export default db;
