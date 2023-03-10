	
declare module "vue-frontend-utils" {

	import type {IModalRegistration} from "vue-frontend-utils";

	interface ModalDefinitions {
			"table:create-entry": { table: TableViewer; },
			"table:edit-entry": { table: TableViewer; item: any; },
			"queries:panel": { type: string; },
			"queries:save": { type: string; },
			"updates:info": { info: UpdateInformation; },

	}

	interface ModalVars {
			createEntryModal: ModalDefinitions["table:create-entry"],
			editEntryModal: ModalDefinitions["table:edit-entry"],
			queriesPanelModal: ModalDefinitions["queries:panel"],
			saveQueryModal: ModalDefinitions["queries:save"],
			updateModal: ModalDefinitions["updates:info"],

	}	

	interface IModalManager {
		get<T extends keyof ModalDefinitions>(name: T): IModalRegistration<T extends keyof ModalDefinitions ? T : any>;

		isRegistered<T extends keyof ModalDefinitions>(name: T): boolean;

		unregister<T extends keyof ModalDefinitions>(name: T): void;

		show<T extends keyof ModalDefinitions>(name: T, data?: T extends keyof ModalDefinitions ? ModalDefinitions[T] : any): void;

		showOnly<T extends keyof ModalDefinitions>(name: T, data?: any): void;

		opened<T extends keyof ModalDefinitions>(name: T, data?: any): void;

		closed<T extends keyof ModalDefinitions>(name: T): void;

		isOpen<T extends keyof ModalDefinitions>(name: T): boolean;

		closeAllExcept<T extends keyof ModalDefinitions>(name: T): void;

		getData<T extends keyof ModalDefinitions>(name: T): T extends keyof ModalDefinitions ? ModalDefinitions[T] : any | any;
	}

}

export {};
