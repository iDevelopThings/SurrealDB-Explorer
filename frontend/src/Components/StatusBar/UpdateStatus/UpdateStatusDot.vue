<template>
	<div class="w-3 h-3 rounded-full" :class="[dotBg]"></div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {app} from "../../../Stores/AppStore";

const dotBg = computed(() => {
	const update = app.$updater.info;

	if (update.version.major > app.$updater.currentVersion.major) {
		return "bg-red-500";
	}

	if (update.version.minor > app.$updater.currentVersion.minor) {
		return "bg-amber-500";
	}

	if (update.version.patch > app.$updater.currentVersion.patch) {
		return "bg-yellow-400/80";
	}


	return "bg-green-500";
});

</script>

