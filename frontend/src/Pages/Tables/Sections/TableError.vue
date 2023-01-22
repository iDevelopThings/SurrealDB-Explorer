<template>
	<div class="flex flex-col items-center justify-center text-center py-8 w-full h-full relative">
		<div
			class="flex flex-col items-center justify-center bg-main-800/90 rounded-lg px-6 py-4 shadow-xl"
			style="z-index: 10"
		>
			<FaceSmileIcon class="w-12 h-12 text-main-200 mb-3" />

			<p class="text-main-200 text-sm font-semibold">
				{{ table.errorMessageSections.title }}
			</p>

			<p class="text-main-300 text-sm font-semibold">
				{{ table.errorMessageSections.message }}
			</p>

		</div>
	</div>
</template>

<script setup lang="ts">
import {FaceSmileIcon} from "@heroicons/vue/24/outline";
import {TableViewer} from "@/Services/TableViewer/TableViewer";

const props = defineProps<{
	table: TableViewer
}>();
</script>

