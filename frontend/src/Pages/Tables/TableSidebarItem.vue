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
			class="group transition "
			:class="{
				'bg-main-700': isActive,
				'hover:bg-main-700': !isActive,
			}"
		>
			<div class="flex flex-row items-center space-x-4">
				<div class="flex flex-col">
					<p
						:class="{
							'text-main-200': !isActive,
							'text-white': isActive,
						}"
						class="font-semibold tracking-wide px-6 py-4"
					>
						{{ title }}
					</p>
				</div>
			</div>
		</a>
	</RouterLink>


</template>

<script lang="ts">
import {type RouteLocationRaw, RouterLink} from "vue-router";
import {defineComponent} from "vue";

export default defineComponent({
	emits : ["click"],


	props : {
		to    : {
			required : true
		},
		title : {
			type     : String,
			required : true
		},
		// @ts-ignore
		...RouterLink.props,

	},

	methods : {
		handleNavigate(event, navigate) {
			event.preventDefault();
			this.$emit("click", event);
			navigate();
		}
	}
});
</script>
