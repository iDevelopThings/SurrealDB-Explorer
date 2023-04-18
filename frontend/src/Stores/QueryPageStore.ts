import {Store} from "@idevelopthings/vue-class-stores/vue";
import db from "../Services/Database/Database";
import {Editor} from "@/Services/Monaco/Editor";
import {type Ref, nextTick} from "vue";
import {LocalStorage} from "typesafe-local-storage";
import {type EventSubscriptionContract, modal} from "vue-frontend-utils";
import {QueryResult} from "@/Services/Database/QueryResult";
import {UpdatePreferences} from "../../wailsjs/go/backend/App";
import {app} from "@/Stores/AppStore";

export type PaneSize = { min: number, max: number, size: number };

export type QueryRunResult = {
	error?: string;
	result?: any;

	queryResult: QueryResult
}

export type PageLayout = "horizontal" | "vertical";

interface IQueryPageStore {
	running: boolean;

	expandResultPanel: boolean;

	result: QueryRunResult;

	viewRawResponse: boolean;

	paneSizes: PaneSize[];
	layout: PageLayout;
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
			},
			paneSizes         : [
				{min : 10, max : 100, size : 90},
				{min : 10, max : 100, size : 10},
			],
			layout            : "horizontal",
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

		this.state.paneSizes = app.$appConfig.preferences.paneSizes;
		this.state.layout    = app.$appConfig.preferences.panelLayout as PageLayout;

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

	toggleLayout() {
		this.$layout = this.$layout === "horizontal" ? "vertical" : "horizontal";

		const current       = app.$appConfig.preferences;
		current.panelLayout = this.$layout;
		UpdatePreferences(JSON.parse(JSON.stringify(current))).catch(console.error);
	}

	onPaneResized(event: { min: number, max: number, size: number }[]) {
		this.state.paneSizes = event;

		const current     = app.$appConfig.preferences;
		current.paneSizes = event;
		UpdatePreferences(JSON.parse(JSON.stringify(current))).catch(console.error);
	}
}

export const queryPage = new QueryPageStore();
