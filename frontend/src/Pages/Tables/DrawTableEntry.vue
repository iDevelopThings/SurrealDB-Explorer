<template>

	<div class="bg-slate-700 rounded shadow px-6 py-4">

		<div v-for="field in $table.$fields">
			<DrawTableField :item="item" :field="field" />
		</div>

	</div>

</template>

<script setup lang="ts">

import {tableStore} from "../../Stores/TableStore";
import DrawTableField from "./DrawTableField.vue";


const props = withDefaults(defineProps<{
	item: { [key: string]: any }
}>(), {});
</script>

