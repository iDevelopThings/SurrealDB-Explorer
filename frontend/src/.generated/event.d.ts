	
declare module "vue-frontend-utils" {
	import {RegisteredEvent} from "vue-frontend-utils";

	interface EventMap {
			"modal:table:create-entry:open": { table: TableViewer; },
			"modal:table:create-entry:close": { table: TableViewer; },
			"modal:table:edit-entry:open": { table: TableViewer; item: any; },
			"modal:table:edit-entry:close": { table: TableViewer; item: any; },
			"modal:queries:panel:open": { type: string; },
			"modal:queries:panel:close": { type: string; },
			"modal:queries:save:open": { type: string; },
			"modal:queries:save:close": { type: string; },
			"modal:updates:info:open": { info: UpdateInformation; },
			"modal:updates:info:close": { info: UpdateInformation; },

			"editor:run:" + this.currentType: { content: string; },
			"confetti:start": { maxLoops: number; },
			"confetti:stop": any,
			"database:lost-connection": any,
			"database:reconnected": number,
			"database:disconnected": Connection,

	}

}

export {};
