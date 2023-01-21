	
declare module "vue-frontend-utils" {
	import {RegisteredEvent} from "vue-frontend-utils";

	interface EventMap {
			"modal:table:create-entry:open": { table: TableViewer; },
			"modal:table:create-entry:close": { table: TableViewer; },
			"modal:queries:panel:open": { type: string; },
			"modal:queries:panel:close": { type: string; },
			"modal:queries:save:open": { type: string; },
			"modal:queries:save:close": { type: string; },

			"editor:run": { content: string; },
			"database:lost-connection": any,
			"database:reconnected": number,
			"database:disconnected": Connection,

	}

}

export {};
