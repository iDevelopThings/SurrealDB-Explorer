<template>
	<div class="flex flex-row items-center space-x-4 w-full">
		<div class="text-xs font-semibold text-slate-200 py-2">{{ field.name }}:</div>
		<div class="flex flex-row flex-grow">
			<ThingField
				:canLink="false"
				v-if="field.name === 'id'"
				:field="field"
				:item="item"
			/>
			<ThingField
				:canLink="false"
				v-else-if="field.type.includes('record')"
				:field="field"
				:item="item"
			/>
			<!--			<ThingField
							:canLink="false"
							v-else-if="field.type === 'object' && field.children.length > 0"
							:field="field"
							:item="item"
						/>-->
			<div class="flex flex-row" v-else-if="field.type === 'object' && field.children.length > 0">
				<DrawTableField
					v-for="child in field.children"
					:canLink="true"
					:field="child"
					:item="$table.getFieldValue(field, item) ?? {}"
				/>
			</div>
			<div class="flex flex-col w-full" v-else-if="field.type === 'array' && field.children.length > 0">
				<DrawTableField
					v-for="(child, idx) in ($table.getFieldValue(field, item) ?? [])"
					:field="field.children[0]"
					:item="child"
				/>
			</div>
			<div v-else class="text-red-400">
				{{ $table.getFieldValue(field, item) }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {SchemaField} from "surrealdb.schema";
import ThingField from "./Fields/ThingField.vue";

const props = withDefaults(defineProps<{
	item?: any,
	field: SchemaField
}>(), {});
</script>

