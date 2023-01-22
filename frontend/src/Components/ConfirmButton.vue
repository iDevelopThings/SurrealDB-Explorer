<template>

	<div>

		<component @click="startAction" v-if="!triggered" :is="slotComp" />

		<SimpleButton
			v-if="triggered"
			v-bind="$props"
			@click="confirm"
			:class="confirmClasses || ''"
			:disabled="loading"
			:loading="loading"
		>
			<template #icon>
				<component :is="confirmIcon" class="w-4 h-4" v-if="confirmIcon && !loading" />
				<Spinner class="w-4 h-4" v-if="loading" />
			</template>

			<template v-if="message && message.trim()">
				<span class="ml-2">{{ message }}</span>
			</template>
		</SimpleButton>
	</div>


</template>

<script setup lang="ts">
import {ref, useSlots, type Component} from "vue";
import SimpleButton from "./SimpleButton.vue";
import {Spinner} from "vue-frontend-utils";

const props = withDefaults(defineProps<{
	message?: string,
	action: (...args: any) => any,
	confirmClasses?: string,
	confirmIcon?: Component
}>(), {
	message : "Click again to confirm"
});

const slots    = useSlots();
const slotComp = slots.default()[0];

const triggered = ref(false);
const loading   = ref(false);
const timeout   = ref(null);

const startAction = () => {
	if (!triggered.value) {
		triggered.value = true;

		timeout.value = setTimeout(() => {
			triggered.value = false;
		}, 3000);
	}
};

slotComp.props.onClick = startAction;

function confirm() {
	clearTimeout(timeout.value);

	loading.value = true;

	const result = props.action();
	if (result instanceof Promise) {
		result.finally(() => {
			loading.value   = false;
			triggered.value = false;
		});
	} else {
		loading.value   = false;
		triggered.value = false;
	}

}

</script>

