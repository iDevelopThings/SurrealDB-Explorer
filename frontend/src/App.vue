<template>

	<ModalDrawer />

	<div class="w-full flex flex-col h-full overflow-y-hidden overflow-x-hidden">

		<div class="w-full flex flex-row h-full overflow-y-hidden">
			<AppSidebar />
<!--            border-l border-l-main-500-->
			<div
				ref="pageWrapper"
				class="h-full w-full overflow-y-hidden"
			>

				<template v-if="$table.hasTables()">
					<div v-for="(viewer, key) in $table.$tables">
						<ViewEntryModal :key="key" :viewer="viewer" />
					</div>
				</template>

				<router-view v-slot="{ Component, route }">
					<component :key="route.path" :is="Component" />
				</router-view>

			</div>
		</div>

		<StatusBar ref="statusBar" />
	</div>


</template>

<script setup lang="ts">
import AppSidebar from "./Components/Layout/AppSidebar.vue";
import ModalDrawer from "./Components/ModalDrawer.vue";
import {ref, onUnmounted, onMounted, watch} from "vue";
import {app} from "./Stores/AppStore";
import StatusBar from "./Components/StatusBar/StatusBar.vue";
import ViewEntryModal from "./Pages/Tables/ViewEntryModal.vue";

const pageWrapper = ref<HTMLElement | null>(null);
const statusBar   = ref<typeof StatusBar>(null);

onMounted(() => {
	app.setupPageWatcher(pageWrapper, statusBar);
});
onUnmounted(() => {
	app.setupPageWatcher(null, null);
});


</script>
