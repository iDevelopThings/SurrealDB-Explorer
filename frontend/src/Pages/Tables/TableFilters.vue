<template>
	<div class="flex flex-col px-6 py-4 w-full border-t border-t-main-500" v-if="table.showFilters">

		<form
			class="flex flex-row items-center w-full space-x-3"
			@submit.prevent="table.addFilter()"
			:class="{'mb-4': table.filters.length > 0}"
		>
			<input type="text" v-model="table.inputFilter.field" class="text-sm max-w-[12em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Field" />
			<input type="text" v-model="table.inputFilter.operator" class="text-sm max-w-[8em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Operator" />
			<input type="text" v-model="table.inputFilter.value" class="text-sm w-full bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Pattern" />

			<SimpleButton type="submit" :icon="PlusIcon" class="ml-4">
				Add Filter
			</SimpleButton>
		</form>

		<div
			class="flex flex-row items-center w-full space-x-3"
			v-for="(filter,idx) in table.filters"
			:key="idx"
		>
			<input type="text" v-model="filter.field" class="text-sm max-w-[12em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Field" />
			<input type="text" v-model="filter.operator" class="text-sm max-w-[8em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Operator" />
			<input type="text" v-model="filter.value" class="text-sm w-full bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Pattern" />

			<SimpleButton type="submit" @click="table.removeFilter(idx)" :icon="MinusIcon" class="ml-4">

			</SimpleButton>
		</div>

	</div>
</template>

<script setup lang="ts">
import {TableViewer} from "../../Stores/TableViewer";
import {PlusIcon} from "@heroicons/vue/20/solid";
import SimpleButton from "../../Components/SimpleButton.vue";

const props = defineProps<{
	table: TableViewer
}>();
</script>

