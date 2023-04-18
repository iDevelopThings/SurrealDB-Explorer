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
			class="group hover:bg-slate-700 rounded-lg hover:shadow-md"
			:class="{
				'px-4 py-2' : $app.$sidebarExpanded,
				'px-2 py-2' : !$app.$sidebarExpanded,
				'bg-main-700': isActive,
				'hover:bg-main-700': !isActive,
			}"
		>
			<div class="flex flex-row items-center" :class="{'justify-center' : !$app.$sidebarExpanded}">
				<span><component :is="icon" v-if="icon" class="w-6" :class="{
					'mr-4' : $app.$sidebarExpanded,
					'text-fuchsia-400':isActive,
					'text-main-200' : !isActive,
				}" /></span>
				<div class="flex flex-col" v-if="$app.$sidebarExpanded">
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

