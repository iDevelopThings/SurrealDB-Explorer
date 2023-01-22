import {Store, OnInit} from "@idevelopthings/vue-class-stores/vue";
import db from "../Services/Database/Database";
import {backend} from "../../wailsjs/go/models";
import {connectionStore} from "./ConnectionStore";
import {Theme} from "../Services/Theme";
import {GetAllConfig} from "../../wailsjs/go/backend/App";
import {Editor, EditEntryEditor, CreateEntryEditor, EditorManager} from "../Services/Monaco/Editor";
import {type Ref, watch, computed, type ComputedRef} from "vue";
import {useElementSize} from "@vueuse/core";
import {type WatchStopHandle} from "@vue/runtime-core";
import {Updater} from "../Services/Updater/Updater";
import StatusBar from "../Components/StatusBar/StatusBar.vue";


interface IAppStore {
	updater: Updater;
	appConfig: backend.AllConfig;

	pageWatcher: {
		height: number,
		watcher: WatchStopHandle,
	};
}

class AppStore extends Store<AppStore, IAppStore>() {

	public static vueBinding = "$app";

	get state(): IAppStore {
		return {
			appConfig : null,

			updater : null,

			pageWatcher : {
				height  : 0,
				watcher : null,
			}
		};
	}

	public pageHeight : ComputedRef<number>;

	@OnInit
	async init() {
		Theme.load();

		await EditorManager.configureEditor();

		Editor.setup();
		EditEntryEditor.setup();
		CreateEntryEditor.setup();

		this.state.updater = await Updater.init();

		await this.loadConfig();
	}

	public get db() {
		return db;
	}

	private async loadConfig() {
		this.state.appConfig = await GetAllConfig();

		connectionStore.state.connections = this.state.appConfig.connections;

		if (this.state.appConfig.connections.current) {
			await connectionStore.connect(connectionStore.connections.find(c => c.id === this.state.appConfig.connections.current));
		}
	}


	public setupPageWatcher(
		pageWrapper: Ref<HTMLElement | null>,
		statusBar: Ref<typeof StatusBar>,
	): void {

		if (this.$pageWatcher.watcher) {
			console.error("Page watcher already setup", this.$pageWatcher.watcher, pageWrapper);
			return;
		}

		const pageWrapperSize = useElementSize(pageWrapper);
		const statusBarSize   = useElementSize(statusBar.value?.$el);

		this.pageHeight = computed(() => {
			if (!pageWrapper.value) {
				return 0;
			}

			return pageWrapperSize.height.value - statusBarSize.height.value;
		});

	}


}

export const app = new AppStore();
