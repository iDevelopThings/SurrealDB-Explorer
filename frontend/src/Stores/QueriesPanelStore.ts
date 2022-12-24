import {Store} from "@idevelopthings/vue-class-stores/vue";
import {useAsyncHandler, useMemoizedAsyncHandler} from "vue-frontend-utils";
import {SaveQuery, GetQueries, DeleteQuery} from "../../wailsjs/go/Config/QueriesList";
import {Editor} from "../Services/Monaco/Editor";
import {connectionStore} from "./ConnectionStore";
import {Config} from "../../wailsjs/go/models";
import SaveQueryRequest = Config.SaveQueryRequest;


interface IQueriesPanelStore {
	list: {
		saved: Array<Config.Query>;
		history: Array<Config.Query>;
	};
}

export const saveQuery = useAsyncHandler(async (name: string) => {
	const query = await SaveQuery(SaveQueryRequest.createFrom({
		title        : name,
		query        : Editor.content.value,
		connectionId : connectionStore.$current.id
	}));

	queryPanel.saved.unshift(query);

	return query;
});

export const loadSavedQueries = useMemoizedAsyncHandler(async (connectionId: string) => {
	const query = await GetQueries(connectionId);

	queryPanel.setSavedQueries(query);

	return query;
});

export const deleteSavedQuery = useAsyncHandler(async (queryId: string) => {
	const queries = await DeleteQuery(queryId);

	queryPanel.setSavedQueries(queries);

	return queries;
});


class QueriesPanelStore extends Store<QueriesPanelStore, IQueriesPanelStore>() {

	get state(): IQueriesPanelStore {
		return {
			list : {
				saved   : [],
				history : [],
			}
		};
	}

	setSavedQueries(queries: Array<Config.Query>) {
		// Sort queries by id str (newest first)
		this.state.list.saved = queries.sort((a, b) => b.id.localeCompare(a.id));
	}

	get saved() {
		return this.state.list.saved;
	}

	async deleteSaved(query: Config.Query) {
		if ((query as any)._deleting) return;

		(query as any)._deleting = true;

		await deleteSavedQuery(query.id);

		(query as any)._deleting = false;
	}

}

export const queryPanel = new QueriesPanelStore();

