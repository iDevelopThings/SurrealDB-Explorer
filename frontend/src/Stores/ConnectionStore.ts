import {Store, StoreManager, Computed, OnInit} from "@idevelopthings/vue-class-stores/vue";
import {Config} from "../../wailsjs/go/models";
import {Add, SetCurrent} from "../../wailsjs/go/Config/Connections";
import {AsyncFunc} from "@/Services/AsyncProcessor";
import db, {onLostConnection, onDisconnect, onReconnected} from "../Services/Database/Database";
import {schemaStore} from "./SchemaStore";
import {SurrealSchema} from "surrealdb.schema";



export enum ConnectionStatus {
	Disconnected = "Disconnected",
	Failed       = "Failed",
	Connecting   = "Connecting",
	Connected    = "Connected",
	Reconnecting = "Reconnecting",
}

interface IConnectionStore {
	loading: boolean;

	connections: Config.Connections;
	current?: Config.Connection;
	connecting: string;
	status: ConnectionStatus;
	addPanelExpanded: boolean;
}


class ConnectionStore extends Store<ConnectionStore, IConnectionStore>() {

	get state(): IConnectionStore {
		return {
			loading     : false,
			connections : null,
			current     : null,
			connecting  : null,
			status      : ConnectionStatus.Disconnected,

			addPanelExpanded : false,
		};
	}

	@OnInit
	private onInit() {
		onLostConnection.subscribe(() => this.onLostConnection());
		onDisconnect.subscribe((connection) => this.onDisconnect(connection));
		onReconnected.subscribe((attempts) => this.onReconnected(attempts));
	}

	get connections(): Config.Connection[] {
		if (!this.state.connections) return [];

		return this.state.connections.connections;
	}

	public addConnection = AsyncFunc<[Config.Connection]>(async (handler, connection: Config.Connection) => {
		const addedConnection = await Add(new Config.Connection(connection));

		(addedConnection as any).highlight = true;


		this.state.connections.connections.push(addedConnection);

		connection.name      = "";
		connection.host      = "";
		connection.user      = "";
		connection.pass      = "";
		connection.database  = "";
		connection.namespace = "";

		this.state.addPanelExpanded = false;
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

		this.state.status  = ConnectionStatus.Disconnected;
		this.state.current = null;

		await SetCurrent(null);

	}

	async connect(connection: Config.Connection) {
		if (this.state.current) {
			await this.disconnect();
		}
		this.state.status = ConnectionStatus.Connecting;

		this.state.connecting = connection.id;

		try {
			const result = await db.connect(connection);

			if (result.didFail()) {
				this.state.status     = ConnectionStatus.Failed;
				this.state.connecting = null;
				return false;
			}
		} catch (e) {
			console.error("Failed to connect to db: ", e);
			this.state.status     = ConnectionStatus.Failed;
			this.state.connecting = null;
			return false;
		}

		this.state.current    = connection;
		this.state.connecting = null;
		this.state.status     = ConnectionStatus.Connected;

		await SetCurrent(connection.id);

		await this.loadConnectionSchema();

		return true;
	}

	private async loadConnectionSchema() {
		try {
			const config = {
				host      : this.state.current.host,
				user      : this.state.current.user,
				pass      : this.state.current.pass,
				namespace : this.state.current.namespace,
				database  : this.state.current.database,
			};
			SurrealSchema.init(config);
			await schemaStore.loadSchema(config);
		} catch (e) {
			console.error("Failed to load schema: ", e);
		}
	}

	private async onDisconnect(connection: Config.Connection) {
		console.log("Database disconnected: ", "is current: ", connection?.id === this.state.current?.id, connection);

		this.state.current    = null;
		this.state.connecting = null;
		this.state.status     = ConnectionStatus.Disconnected;

		await SetCurrent(null);
	}

	private onLostConnection(): any {
		this.state.status = ConnectionStatus.Reconnecting;
		console.log("> Lost connection to database");
	}

	private onReconnected(attempts: number): any {
		this.state.status = ConnectionStatus.Connected;

		console.log("> Reconnected after ", attempts, " attempts");
	}

	@Computed
	public get connectResult() {
		return db.state.status;
	}

	public get status() {
		return this.state.status;
	}

}

export const connectionStore = new ConnectionStore();
