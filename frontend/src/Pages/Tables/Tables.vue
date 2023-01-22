<template>
	<div class="w-full h-full flex flex-row" v-if="schemaStore.isLoading">
		<Spinner />
	</div>
	<div v-else class="w-full h-full flex flex-row">
		<TablesSidebar />

		<div class="h-full w-full border-l border-l-main-500">
			<router-view v-slot="{ Component,route }">
				<component :key="route.path" :is="Component" />
			</router-view>
		</div>
	</div>


</template>

<script setup lang="ts">
import {schemaStore} from "@/Stores/SchemaStore";
import Spinner from "../../Components/Spinner.vue";
import TablesSidebar from "./TablesSidebar.vue";

</script>

