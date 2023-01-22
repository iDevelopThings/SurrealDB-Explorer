<template>
	<div
		class="space-y-6 py-8 flex flex-col w-full h-full relative overflow-y-hidden"
		:style="{maxHeight: $app.pageHeight + 'px'}"
	>
		<AddConnection />

		<p class="text-2xl text-main-200">
			Your Connections:
		</p>

		<div v-for="connection in $connection.connections">
			<ConnectionCard :connection="connection" />
		</div>
	</div>

</template>

<script setup lang="ts">
import ConnectionCard from "./ConnectionCard.vue";
import AddConnection from "./AddConnection.vue";
</script>

