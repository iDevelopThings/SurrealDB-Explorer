<template>
	<div class="flex flex-col w-full h-full relative overflow-y-hidden" :style="{maxHeight: app.pageHeight + 'px'}">

		<SaveQueryModal/>

		<ActionsHeader ref="actionsHeaderComp" />

		<div class="flex flex-row w-full h-full relative overflow-x-hidden">
			<QueriesPanel />

			<div class="flex flex-col w-full h-full relative">

				<div class="flex flex-col h-full overflow-y-hidden panel">
					<div ref="monacoEl" class="flex h-full"></div>
				</div>

				<div class="border-t border-t-main-500 absolute bottom-0 w-full">

					<ResultPanelHeader />

					<template v-if="$queryPage.resultPanelExpanded">
						<div class="px-6 py-2 bg-red-500 bg-opacity-50 text-white" v-if="$queryPage.resultError">
							<p class="font-black text-xs text-white">Failed to run query</p>
							<p class="text-sm">{{ $queryPage.resultError }}</p>
						</div>

						<JsonEditorVue
							ref="jsonEditorVueRef"
							class="jse-theme-custom query-jse h-full"
							mode="text"
							read-only
							v-model="$queryPage.resultValue"
						/>
					</template>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import JsonEditorVue from "json-editor-vue";
import {ref, onMounted, onBeforeUnmount} from "vue";
import {app} from "../../Stores/AppStore";
import ActionsHeader from "./ActionsHeader.vue";
import {queryPage} from "../../Stores/QueryPageStore";
import ResultPanelHeader from "./ResultPanelHeader.vue";
import QueriesPanel from "./QueriesPanel/QueriesPanel.vue";
import SaveQueryModal from "./QueriesPanel/SaveQueryModal.vue";

const monacoEl = ref<HTMLElement>();

onMounted(() => {
	queryPage.init({
		monacoEl : monacoEl,
	});
});

onBeforeUnmount(() => queryPage.dispose());

</script>

<style lang="postcss">


.query-jse {

}

.query-jse .jse-main {
	max-height: 60vh;
}

</style>

