<template>
	<div class="flex flex-row items-center px-6 py-4 justify-between">
		<div class="flex flex-row items-center space-x-2">
			<SimpleButton @click="table.refresh()" :icon="ArrowPathIcon" :loading="table.loading">
				Refresh
			</SimpleButton>

			<SimpleButton @click="table.filters.toggle()" :icon="FunnelIcon">
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
</template>

<script setup lang="ts">
import {ArrowPathIcon, FunnelIcon, PlusIcon, TrashIcon, CursorArrowRaysIcon, XMarkIcon} from "@heroicons/vue/20/solid";
import SimpleButton from "../../../Components/SimpleButton.vue";
import {TableViewer} from "../../../Services/TableViewer/TableViewer";

const props = defineProps<{
	table: TableViewer
}>();
</script>

