import {Store, StoreManager} from "@idevelopthings/vue-class-stores/vue";
import {Config} from "../../wailsjs/go/models";
import {Add, SetCurrent} from "../../wailsjs/go/Config/Connections";
import {AsyncFunc} from "../Services/AsyncProcessor";
import db, {ConnectionResult} from "../Services/Database/Database";
import {schemaStore} from "./SchemaStore";
import {SurrealSchema} from "surrealdb.schema";


interface IConnectionStore {
	loading: boolean;

	connections: Config.Connections;
	current?: Config.Connection;
	connecting: string;
	connectionResult: ConnectionResult | null;
}

class ConnectionStore extends Store<ConnectionStore, IConnectionStore>() {

	get state(): IConnectionStore {
		return {
			loading     : false,
			connections : null,

			current    : null,
			connecting : null,

			connectionResult : null,
		};
	}

	get connections(): Config.Connection[] {
		return this.state.connections.connections;
	}

	private async validateConnection(connection: Config.Connection): Promise<boolean> {

		try {
			const response = await db.httpRequest<any[]>({
				host      : connection.host,
				user      : connection.user,
				pass      : connection.pass,
				database  : connection.database,
				namespace : connection.namespace,
			}, "INFO FOR KV;");

			return response !== undefined;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	public addConnection = AsyncFunc<[Config.Connection]>(async (handler, connection: Config.Connection) => {
//		if (!(await this.validateConnection(connection))) {
//			handler.error("Invalid connection");
//			return;
//		}

		this.state.connections.connections.push(
			await Add(new Config.Connection(connection))
		);

		connection.name      = "";
		connection.host      = "";
		connection.user      = "";
		connection.pass      = "";
		connection.database  = "";
		connection.namespace = "";
	});

	get current() {
		return this.state.current;
	}

	public async disconnect() {
		if (!this.state.current) return;

		db.disconnect();

		StoreManager.bus.$dispatchToAllStores("connection:disconnect", {
			connection : this.state.current
		});

		this.state.current = null;

		await SetCurrent(null);

	}

	async connect(connection: Config.Connection) {
		this.state.connecting = connection.id;

		if (this.state.current) {
			await this.disconnect();
		}

		const config = {
			host      : connection.host,
			user      : connection.user,
			pass      : connection.pass,
			namespace : connection.namespace,
			database  : connection.database,
		};


		try {
			this.state.connectionResult = await db.connect(config);

			if (this.state.connectionResult.error) {
				this.state.connecting = null;
				return false;
			}
		} catch (e) {
			console.error("Failed to connect to db: ", e);
			this.state.connecting = null;
			return false;
		}

		this.state.current = connection;

		try {
			SurrealSchema.init(config).config = config;
			await schemaStore.loadSchema(config);
		} catch (e) {
			console.error("Failed to load schema: ", e);
		}

		await SetCurrent(connection.id);


		this.state.connecting = null;

		return true;
	}

}

export const connectionStore = new ConnectionStore();
