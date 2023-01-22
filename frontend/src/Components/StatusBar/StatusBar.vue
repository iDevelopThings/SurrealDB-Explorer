<template>

	<div class="border-t border-t-main-500 px-3 py-2 flex flex-row justify-between">

		<CurrentConnection/>
		<UpdateStatus/>

	</div>



</template>

<script setup lang="ts">
import CurrentConnection from "./ConnectionStatus/CurrentConnection.vue";
import UpdateStatus from "./UpdateStatus/UpdateStatus.vue";
</script>

