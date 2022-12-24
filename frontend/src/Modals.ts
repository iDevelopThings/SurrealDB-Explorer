import {defineModal} from "vue-frontend-utils";
import CreateEntryModal from "./Pages/Tables/CreateEntryModal.vue";
import {TableViewer} from "./Stores/TableViewer";

const createEntryModal = defineModal<{ table: TableViewer }>("table:create-entry", CreateEntryModal);

const queriesPanelModal = defineModal<{ type?: string }>("queries:panel", null);
const saveQueryModal    = defineModal<{ type?: string }>("queries:save", null);
