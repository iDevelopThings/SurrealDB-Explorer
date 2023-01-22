<template>
	<RegularModal
		:modal="$modals.get('updates:info')"
		modal-type="success"
		confirm-title="Get Update"
		no-padding
		hide-icon
		@confirmed="confirmed"
		modal-size="lg"
	>
		<template #body>
			<div class="flex flex-col divide-y divide-main-500">
				<div class="px-6 pt-6">
					<p class="text-white tracking-wide text-lg mb-4">Changelog:</p>
				</div>

				<div class="bg-main-800 overflow-hidden changelog-body px-6 py-4">
					<div v-if="$app.$updater.info.processingBody" class="flex flex-col items-center justify-center space-y-3">
						<Spinner />
						<p class="text-main-400 tracking-wide text-sm text-center">Loading....</p>
					</div>
					<component v-else :is="$app.$updater.info.bodyComponent" class="prose prose-invert" />
				</div>

			</div>
		</template>


	</RegularModal>
</template>

<script setup lang="ts">
import RegularModal from "../../RegularModal.vue";
import Spinner from "../../Spinner.vue";
import {BrowserOpenURL} from "../../../../wailsjs/runtime";
import {app} from "../../../Stores/AppStore";

function confirmed() {
	BrowserOpenURL(app.$updater.info.url);
}

</script>

<style>
.changelog-body h1, h2, h3, h4, h5, h6 {
	margin-top: 0 !important;
	padding-top: 0 !important;
}
</style>
