<template>

	<div v-if="$queryPage.queriesPanel.isOpen()" class="h-full w-full min-w-[20em] max-w-sm bg-main-900 border-r border-r-main-500">
		<div class="border-b border-b-main-500 p-3 space-x-2 flex flex-row items-center">
			<a
				href="javascript:;"
				class="px-2 py-0.5 transition font-semibold tracking-wide rounded"
				:class="{
                    'bg-main-700 text-white': isSelected(tab),
					'text-main-300 hover:text-main-200': !isSelected(tab),
				}"
				v-for="tab in tabs"
				@click="selectTab(tab)"
			>
				{{ tab.title }}
			</a>
		</div>

		<component :is="selectedTab.component"/>

	</div>

</template>

<script lang="ts" setup>

import {ref, shallowRef} from "vue";
import SavedQueries from "./SavedQueries.vue";
import QueryHistory from "./QueryHistory.vue";

const tabs = [
	{
		title     : "Saved",
		component : SavedQueries
	},
	{
		title     : "History",
		component : QueryHistory
	}
];

const selectedTab = shallowRef(tabs[0]);

const selectTab = (tab) => {
	selectedTab.value = tab;
};

const isSelected = (tab) => {
	return selectedTab.value.title === tab.title;
};


</script>

