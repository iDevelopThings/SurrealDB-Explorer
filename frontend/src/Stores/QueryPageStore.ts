import {Store} from "@idevelopthings/vue-class-stores/vue";
import db from "../Services/Database/Database";
import {Editor} from "../Services/Monaco/Editor";
import {type Ref, nextTick} from "vue";
import {LocalStorage} from "typesafe-local-storage";
import {type EventSubscriptionContract, modal} from "vue-frontend-utils";
import {QueryResult} from "../Services/Database/QueryResult";

export type QueryRunResult = {
	error?: string;
	result?: any;

	queryResult: QueryResult
}

interface IQueryPageStore {
	running: boolean;

	expandResultPanel: boolean;

	result: QueryRunResult;

	viewRawResponse: boolean;
}

class QueryPageStore extends Store<QueryPageStore, IQueryPageStore>() {

	private _onRun: EventSubscriptionContract;
	private _onChange: EventSubscriptionContract;

	private monacoEl: Ref<HTMLElement>;

	get state(): IQueryPageStore {
		return {
			running           : false,
			expandResultPanel : false,
			viewRawResponse   : false,
			result            : {
				error       : undefined,
				result      : undefined,
				queryResult : undefined,
			}
		};
	}

	init(elements: { monacoEl: Ref<HTMLElement> }) {
		this.monacoEl = elements.monacoEl;

		Editor.init(this.monacoEl.value);

		if (LocalStorage.exists("last_query")) {
			Editor.setValue(LocalStorage.get("last_query"));
		}

//		Editor.onRun.invoke({content : Editor.content.value});

		this._onRun    = Editor.onRun.subscribe(this.onRunQuery.bind(this));
		this._onChange = Editor.onChange.subscribe(this.onEditorChange.bind(this));
	}

	async onRunQuery({content}) {
		if (this.$running) {
			return;
		}


		this.$running = true;

		try {
			const result = await db.query(content, {});

			this.$result = {
				error       : result.errorFormatted,
				result      : result.get,
				queryResult : result,
			};
		} catch (e) {
			this.$result = {
				error       : e.message,
				result      : undefined,
				queryResult : undefined,
			};
		}

		if (!this.$expandResultPanel) {
			this.$expandResultPanel = true;
		}

		this.$running = false;
	}

	async runQuery() {
		if (this.$running) {
			return;
		}

		Editor.onRun.invoke({content : Editor.content.value});
	}

	async onEditorChange({content}) {
		LocalStorage.set("last_query", content);
	}

	public dispose(): void {
		Editor.dispose();

		this._onRun.dispose();
		this._onChange.dispose();
	}

	get resultPanelExpanded() {
		return this.$expandResultPanel;
	}

	toggleResultPanel() {
		this.$expandResultPanel = !this.$expandResultPanel;
	}

	toggleQueriesPanel() {
		this.queriesPanel.toggle();
		nextTick(() => {
			Editor.forceResize();
		});
	}

	get queriesPanel() {
		return modal("queries:panel");
	}

	get isProcessing() {
		return this.state.running;
	}

	get resultError() {
		return this.state.result.error;
	}

	toggleRawResponse() {
		this.$viewRawResponse = !this.$viewRawResponse;
	}

	get resultValue() {
		if (this.$result.queryResult) {
			if (this.$viewRawResponse || !this.$result.queryResult.isSelect) {
				return this.$result.queryResult.rawResult;
			}
		}

		return this.state.result.result;
	}

}

export const queryPage = new QueryPageStore();
