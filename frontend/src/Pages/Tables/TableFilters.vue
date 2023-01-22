<template>
	<div class="flex flex-col px-6 py-4 w-full border-t border-t-main-500" v-if="table.filters.show">

		<form
			class="flex flex-row items-center w-full space-x-3"
			@submit.prevent="table.filters.add()"
			:class="{'mb-4': table.filters.filters.length > 0}"
		>
			<input type="text" v-model="table.filters.input.field" class="text-sm max-w-[12em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Field" />
			<input type="text" v-model="table.filters.input.operator" class="text-sm max-w-[8em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Operator" />
			<input type="text" v-model="table.filters.input.value" class="text-sm w-full bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Pattern" />

			<SimpleButton type="submit" :icon="PlusIcon" class="ml-4">
				Add Filter
			</SimpleButton>
		</form>

		<div
			class="flex flex-row items-center w-full space-x-3"
			v-for="(filter,idx) in table.filters.filters"
			:key="idx"
		>
			<input type="text" v-model="filter.field" class="text-sm max-w-[12em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Field" />
			<input type="text" v-model="filter.operator" class="text-sm max-w-[8em] bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Operator" />
			<input type="text" v-model="filter.value" class="text-sm w-full bg-main-800 border border-main-500 rounded-lg px-4 py-2 w-full" placeholder="Pattern" />

			<SimpleButton type="submit" @click="table.filters.remove(idx)" :icon="MinusIcon" class="ml-4">

			</SimpleButton>
		</div>

	</div>
</template>

<script setup lang="ts">
import {TableViewer} from "@/Services/TableViewer/TableViewer";
import {PlusIcon, MinusIcon} from "@heroicons/vue/20/solid";
import SimpleButton from "../../Components/SimpleButton.vue";
import {watch, onBeforeUnmount} from "vue";
import {useDebounce} from "@/Services/Utils/Timeout";

const props = defineProps<{
	table: TableViewer
}>();

const debounce = useDebounce(() => {
	props.table.loadEntries(props.table.loadOptions);
}, 400);

const unsub = watch(props.table.filters.filters, () => {
	debounce.start();
});

onBeforeUnmount(() => {
	unsub();
});

</script>

