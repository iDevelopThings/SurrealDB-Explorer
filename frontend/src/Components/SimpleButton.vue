<template>
	<button

		:class="[
			twMerge(
				'inline-flex flex-row items-center group rounded hover:shadow-md transition px-3 py-2 select-none'
			    + ( cta === true ? 'bg-main-800 hover:bg-main-500 text-white' : 'text-main-200 hover:bg-main-800'),
			     (attrs.class || '')
		    ),
			{
				'disabled:opacity-50 disabled:cursor-not-allowed': loading === true,
			}
		]"
		:disabled="loading === true"
		@click="loading === true ? undefined : $emit('click')"
	>
		<Component
			:is="icon"
			v-if="icon"
			:class="[
				twMerge(
					'w-5 h-5 mr-1.5 transition',
					(loading === true ? 'animate-spin' : '')
				),
				twMerge(
					'text-main-300 hover:text-white',
					(iconClass?.hover && iconClass?.default ? `${iconClass?.hover} group-hover:${iconClass?.default}` : '')
				),
			]"
		/>

		<slot v-if="!icon && $slots.icon" name="icon" />

		<span class="whitespace-nowrap font-semibold tracking-wide text-sm group-hover:text-white transition ">
			<slot />
		</span>
	</button>
</template>

<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {useAttrs} from "vue";

const props = defineProps<{
	icon?: any,
	loading?: boolean,
	cta?: boolean,
	iconClass?: { hover?: string, default?: string }
}>();

const attrs = useAttrs() as any;

defineEmits<{
	(event: "click"): void
}>();
</script>

