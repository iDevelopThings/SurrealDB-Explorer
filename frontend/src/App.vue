<template>

	<ModalDrawer />

	<div class="w-full flex flex-col h-full overflow-y-hidden">
		<div class="w-full flex flex-row h-full overflow-y-hidden">
			<AppSidebar />

			<div
				ref="pageWrapper"
				class="h-full border-l border-l-main-500 w-full overflow-y-hidden"
			>
				<router-view v-slot="{ Component }">
					<transition>
						<keep-alive>
							<component :key="$route.fullPath" :is="Component" />
						</keep-alive>
					</transition>
				</router-view>
			</div>
		</div>

		<StatusBar ref="statusBar" />
	</div>


</template>

<script setup lang="ts">
import AppSidebar from "./Components/Layout/AppSidebar.vue";
import ModalDrawer from "./Components/ModalDrawer.vue";
import StatusBar from "./Components/Layout/StatusBar.vue";
import {ref, onUnmounted, onMounted} from "vue";
import {app} from "./Stores/AppStore";

const pageWrapper = ref<HTMLElement | null>(null);
const statusBar   = ref<typeof StatusBar>(null);

onMounted(() => {
	app.setupPageWatcher(pageWrapper, statusBar);
})
onUnmounted(() => {
	app.setupPageWatcher(null, null);
});


</script>
