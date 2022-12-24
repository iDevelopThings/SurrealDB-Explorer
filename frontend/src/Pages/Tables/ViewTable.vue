<template>
	<div class="max-h-screen h-full w-full ">
		<div v-for="(viewer, key) in tableStore.$tables">
			<ViewEntryModal :key="key" :viewer="viewer" />
		</div>


		<div class="flex flex-col w-full h-full">

			<div ref="header" class="bg-main-700 border-b border-b-main-500 w-full">

				<div class="flex flex-row items-center px-6 py-4 justify-between">
					<div class="flex flex-row items-center space-x-2">
						<SimpleButton @click="table.refresh()" :icon="ArrowPathIcon" :loading="table.loading">
							Refresh
						</SimpleButton>

						<SimpleButton @click="table.showFilters = !table.showFilters" :icon="FunnelIcon">
							Filter
						</SimpleButton>

						<SimpleButton @click="table.toggleSelecting()" :icon="table.isSelecting ? XMarkIcon : CursorArrowRaysIcon">
							{{ table.isSelecting ? 'Cancel Selecting' : 'Select Items' }}
						</SimpleButton>
					</div>
					<div class="flex flex-row items-center space-x-2">
						<SimpleButton
							:icon="TrashIcon"
							v-if="table.isSelecting && table.selection.ids.length"
							@click="table.deleteProcessor.invoke()"
							:loading="table.deleteProcessor.processing"
							class="bg-red-500 text-red-50 hover:bg-red-600 hover:text-red-100"
							:icon-class="{hover: 'text-red-100', default: 'text-red-50'}"
						>
							Delete
						</SimpleButton>

						<SimpleButton :icon="PlusIcon" cta @click="$modals.show('table:create-entry', {table: table})">
							New
						</SimpleButton>
					</div>
				</div>

				<TableFilters :table="table" />

			</div>

			<div
				ref="content"
				class="flex flex-col w-full h-full overflow-y-auto"
				:style="{'max-height': contentHeight}"
			>
				<div
					v-if="table.isSelecting"
					class="bg-blue-500 text-white py-2 px-4"
				>
					<p class="font-bold">In selection mode</p>
					<p class="text-sm">You can select multiple entries and delete them</p>
					<p v-if="table.selection.ids.length > 0" class="mt-1.5">
						<span class="font-black text-white">{{ table.selection.ids.length }}</span> item{{ table.selection.ids.length === 1 ? '' : 's' }} selected
					</p>
				</div>
				<div
					class="flex flex-col w-full h-full"
					v-if="!table.loading"
				>

					<div
						v-for="item in table.entries"
						class="bg-main-700 border-l-4 border-b border-b-main-500"
						@click="table.select(item)"
						:class="[
							(table.isSelected(item) ? 'border-l-blue-500' : 'border-l-transparent'),
						]"
					>
						<JsonViewer
							:key="item.id.toString()"
							ref="jsonViewer"
							:value="item"
							copyable
							sort
							expanded
							:expand-depth="3"
							theme="dark"
							@onKeyClick="keyClick"
						/>

					</div>

				</div>
			</div>

			<div
				ref="footer"
				class="bg-main-700 px-6 py-4 border-t border-t-main-500 flex w-full flex-row items-center"
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
		</div>
	</div>
</template>

<script setup lang="ts">
import {JsonViewer} from "./../../Services/JsonViewer";
import {tableStore} from "../../Stores/TableStore";
import {ref, computed} from "vue";
import {Thing} from "../../Services/Database/Thing";
import ViewEntryModal from "./ViewEntryModal.vue";
import {useElementSize} from "@vueuse/core";
import SimpleButton from "../../Components/SimpleButton.vue";
import TableFilters from "./TableFilters.vue";
import {ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon, PlusIcon, TrashIcon, CursorArrowRaysIcon, XMarkIcon} from "@heroicons/vue/20/solid";

const props = defineProps<{
	name: string,
	id?: Thing
}>();


const jsonViewer = ref<typeof JsonViewer>();
const header     = ref<HTMLDivElement>();
const content    = ref<HTMLDivElement>();
const footer     = ref<HTMLDivElement>();

const headerSize = useElementSize(header);
const footerSize = useElementSize(footer);

const contentHeight = computed(() => {
	return `calc(100vh - (${headerSize.height}px - ${footerSize.height}px))`;
});

tableStore.tryLoad(props);

const keyClick = (keyName) => {
	console.log(jsonViewer);
};


const table = computed(() => {
	return tableStore.get(props.name);
});

</script>

