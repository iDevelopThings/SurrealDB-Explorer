<template>
	<RouterLink
		v-bind="$props"
		custom
		v-slot="{ isActive, href, navigate }"
	>
		<a
			v-bind="$attrs"
			:href="href"
			@click="handleNavigate($event, navigate)"
			class="group px-4 py-2 hover:bg-slate-700 rounded-lg hover:shadow-md"
			:class="{
				'bg-main-700': isActive,
				'hover:bg-main-700': !isActive,
			}"
		>
			<div class="flex flex-row items-center">
				<span><component :is="icon" v-if="icon" class="w-6 mr-4" :class="{
					'text-fuchsia-400':isActive,
					'text-main-200' : !isActive,
				}" /></span>
				<div class="flex flex-col">
					<p class="text-white font-semibold">{{ title }}</p>
				</div>
			</div>
		</a>
	</RouterLink>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	title: string,
	to: string,
	icon: any,
}>(), {});


const emit = defineEmits<{
	(event: 'click'): void
}>();

function handleNavigate(event, navigate) {
	event.preventDefault();
	emit("click");
	navigate();
}
</script>

