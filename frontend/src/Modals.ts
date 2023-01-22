import {defineModal} from "vue-frontend-utils";
import CreateEntryModal from "./Pages/Tables/CreateEntryModal.vue";
import {TableViewer} from "./Services/TableViewer/TableViewer";
import UpdateInfoModal from "./Components/StatusBar/UpdateStatus/UpdateInfoModal.vue";
import {UpdateInformation} from "./Services/Updater/UpdateInformation";
import EditEntryModal from "./Pages/Tables/EditEntryModal.vue";

const createEntryModal = defineModal<{ table: TableViewer }>("table:create-entry", CreateEntryModal);
const editEntryModal   = defineModal<{ table: TableViewer, item: any }>("table:edit-entry", EditEntryModal);

const queriesPanelModal = defineModal<{ type?: string }>("queries:panel", null);
const saveQueryModal    = defineModal<{ type?: string }>("queries:save", null);

const updateModal = defineModal<{ info: UpdateInformation }>("updates:info", UpdateInfoModal);
