<template>
	<template v-if="status === ConnectionStatus.Reconnecting">
		<Spinner class="w-3 h-3 rounded-full" :class="[dotTextColor]"/>
	</template>
	<div v-else class="w-3 h-3 rounded-full" :class="[dotBgColor]"></div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import Spinner from "../../Spinner.vue";
import {ConnectionStatus} from "../../../Stores/ConnectionStore";

const props = defineProps<{
	status: ConnectionStatus;
}>();

const dotBgColor = computed(() => {
	switch (props.status) {
		case ConnectionStatus.Connected:
			return "bg-green-500";
		case ConnectionStatus.Connecting:
			return "bg-yellow-500";
		case ConnectionStatus.Reconnecting:
			return "bg-yellow-500";
		case ConnectionStatus.Disconnected:
		case ConnectionStatus.Failed:
			return "bg-red-500";
	}
});
const dotTextColor = computed(() => {
	switch (props.status) {
		case ConnectionStatus.Connected:
			return "text-green-500";
		case ConnectionStatus.Connecting:
			return "text-yellow-500";
		case ConnectionStatus.Reconnecting:
			return "text-yellow-500";
		case ConnectionStatus.Disconnected:
		case ConnectionStatus.Failed:
			return "text-red-500";
	}
});
</script>

