import {createApp} from "vue";
import App from "./App.vue";
import {StoreManager} from "@idevelopthings/vue-class-stores/vue";
import {router} from "./Routes";
import {VueFrontendUtils, TimePlugin} from "vue-frontend-utils";
import JsonViewer from "./Services/JsonViewer";
import "./Styles/app.css";
import "./Modals";
import "./Window";
import {Logger} from "./Services/Logger";
import Link from "./Components/Link.vue";

Logger.log("Starting app");

StoreManager.config({disableDevtoolsMutationWatcher : true});

const app = createApp(App);

app.component("Link", Link);

app.use(router);
app.use(StoreManager.boot());
app.use(JsonViewer);
app.use(VueFrontendUtils);
app.use(TimePlugin);

app.mount("#app");



(window as any).app = app;
