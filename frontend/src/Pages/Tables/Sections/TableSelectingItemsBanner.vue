<template>
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
</template>
<script lang="ts" setup>
import {TableViewer} from "../../../Services/TableViewer/TableViewer";

const props = defineProps<{
	table: TableViewer
}>();


</script>
