<template>
	<div
		ref="footer"
		class="bg-main-700 px-6 py-0.5 border-t border-t-main-500 flex w-full flex-row items-center"
	>
		<div class="flex flex-row items-center w-full space-x-4" v-if="!table.loading">

			<a
				href="javascript:;"
				:class="{
					'text-main-200': true,
					'hover:text-white' : table.canGetPrev,
					'text-opacity-50': table.page === 1,
					'cursor-not-allowed': !table.canGetPrev
				}"
				@click="table.prevPage()"
				class="px-3 py-2 transition flex flex-row items-center"
			>
				<ChevronLeftIcon class="w-7" />
			</a>

			<div class="inline-flex flex-row items-center space-x-2">
				<span class="text-main-200 font-semibold tracking-wide text-sm ">Page</span>
				<input
					class="text-main-200 max-w-[6em] w-full rounded border border-main-500 px-2 py-0.5 text-xs font-semibold tracking-wide bg-main-700 text-center"
					type="number"
					v-model="table.page"
				>
			</div>

			<span class="text-main-200 font-semibold tracking-wide text-sm ">of</span>
			<span
				class="text-main-200 max-w-[4em] w-full rounded border border-main-500 px-2 py-0.5 text-xs font-semibold tracking-wide bg-main-700 text-center"
			>
				{{ table.totalPages }}
			</span>

			<a
				href="javascript:;"
				@click="table.nextPage()"
				:class="{
					'text-main-200': true,
					'hover:text-white' : table.canGetNext,
					'text-opacity-50': table.page === table.totalPages,
					'cursor-not-allowed': !table.canGetNext
				}"
				class="px-3 py-2 transition flex flex-row items-center"
			>
				<ChevronRightIcon class="w-7" />
			</a>

			<span
				class="text-main-200 rounded border border-main-500 px-2 py-0.5 text-xs font-semibold tracking-wide bg-main-700 text-center"
			>
				<strong class="font-bold text-white mr-1.5">{{ table.totalRows }}</strong>
				<span>Rows</span>
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import {TableViewer} from "../../../Services/TableViewer/TableViewer";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/vue/20/solid";

const props = defineProps<{
	table: TableViewer
}>();
</script>

