<template>
	<span ref="itemRef" class="bg-blue-500 text-white rounded overflow-hidden inline-flex items-center">
		<span class="font-semibold tracking-wide px-2 py-0.5 text-xs">
			{{ value.table }}
		</span>
		<span class="text-white bg-slate-100 font-semibold text-gray-900 px-2">
			{{ value.id }}
		</span>
	</span>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {Thing} from "../../../Services/Database/Thing";

export default defineComponent({
	name  : "ThingField",
	props : {
		value   : {type : Thing, required : true},
		canLink : {type : Boolean, default : false}
	}
});
</script>

