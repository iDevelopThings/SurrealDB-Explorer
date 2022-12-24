declare module "@vue/runtime-core" {
	import type {IEventsManager, IModalManager} from "vue-frontend-utils";

	interface ComponentCustomProperties {
		$events: IEventsManager;
		$modals: IModalManager;
	}
}
export {};
