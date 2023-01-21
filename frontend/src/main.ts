import {createApp} from "vue";
import App from "./App.vue";
import {StoreManager} from "@idevelopthings/vue-class-stores/vue";
import {router} from "./Routes";
import {VueFrontendUtils} from "vue-frontend-utils";
import JsonViewer from "./Services/JsonViewer";
import "./Styles/app.css";
import "./Modals";
import "./Window";
import {Logger} from "./Stores/Logger";

Logger.log("Starting app");

StoreManager.config({disableDevtoolsMutationWatcher : true});

const app = createApp(App);
app.use(router);
app.use(StoreManager.boot());
app.use(JsonViewer);
app.use(VueFrontendUtils);

app.mount("#app");

(window as any).app = app;
