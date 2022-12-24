<template>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-y-auto max-h-screen h-full">
		<div class="mx-auto max-w-3xl">
			<ConnectionManager />
		</div>
	</div>
</template>

<script setup lang="ts">
import {schemaStore} from "../Stores/SchemaStore";
import ConnectionManager from "./Connections/ConnectionManager.vue";



/*schemaStore.loadSchema().then(() => {
	console.log("Schema loaded");

	console.log(schemaStore);
});*/

</script>

