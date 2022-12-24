<template>

	<div class="flex flex-col space-y-6 py-8">


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

