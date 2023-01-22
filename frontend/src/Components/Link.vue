<template>
	<a :href="href" @click.prevent="onClick">
		<slot />
	</a>
</template>

<script setup lang="ts">
import {AppNavigator} from "../Services/Navigator";

const props = withDefaults(defineProps<{
	href: string,
}>(), {});

const onClick = (e: PointerEvent) => {
	AppNavigator.navigate(e, (e.target as HTMLAnchorElement).href);
};
</script>

