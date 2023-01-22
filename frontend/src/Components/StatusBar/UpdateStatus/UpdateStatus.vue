<template>
	<div v-if="$app.$updater" class="flex flex-row space-x-1.5 items-center bg-main-700 rounded-md shadow overflow-hidden">
		<div class="flex flex-row items-center px-2 py-0.5 space-x-1">
			<UpdateStatusDot />
			<span class="text-main-100 font-semibold text-xs">
			{{ $app.$updater.currentVersion }}
		</span>
		</div>

		<button
			v-if="$app.$updater.hasUpdateAvailable"
			@click="$modals.show('updates:info')"
			class="bg-main-400 flex flex-row items-center px-2 py-0.5 space-x-1 "
		>
			<span class="font-semibold text-xs text-white">
				Update Available
			</span>
			<CloudArrowDownIcon class="w-5 text-white "/>
		</button>

	</div>
</template>

<script setup lang="ts">
import UpdateStatusDot from "./UpdateStatusDot.vue";
import {CloudArrowDownIcon} from "@heroicons/vue/24/solid";
</script>

