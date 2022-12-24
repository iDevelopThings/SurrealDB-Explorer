<template>
	<div
		@click="$queryPage.toggleResultPanel()"
		class="border-b flex flex-row items-center justify-between select-none border-b-main-500 w-full cursor-pointer hover:bg-main-800 px-6 transition"
	>
		<div class="py-2 flex flex-row items-center space-x-2">
			<p class="text-sm text-main-200">Query Result</p>
			<Spinner v-if="$queryPage.isProcessing" class="w-4 h-4" />
		</div>
		<ChevronDownIcon class="w-5 h-5 text-white" :class="[$queryPage.resultPanelExpanded ? 'rotate-180' : '']" />
	</div>
</template>

<script setup lang="ts">
import {ChevronDownIcon} from "@heroicons/vue/24/solid";
import {Spinner} from "vue-frontend-utils";

</script>

