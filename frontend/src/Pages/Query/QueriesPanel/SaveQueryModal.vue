<template>

	<RegularModal
		:modal="$modals.get('queries:save')"
		confirm-title="Save"
		modal-type="success"
		no-padding
		hide-icon
		use-form

		@confirmed="saveQuery"
	>
		<template #body>
			<div class="flex flex-col divide-y divide-main-500">
				<div class="px-4 py-6">
					<p class="text-main-200 text-center">This will save the query for the current connection so it can be used in the future</p>
				</div>

				<div class="px-4 py-6">
					<div class="input-group">
						<label for="name">Name</label>
						<input
							type="text"
							id="name"
							class="form-control"
							placeholder="Give this query a name"
							v-model.trim="name"
						/>

					</div>
				</div>

			</div>
		</template>

	</RegularModal>

</template>

<script setup lang="ts">
import RegularModal from "../../../Components/RegularModal.vue";
import {ref} from "vue";
import {saveQuery as SaveQuery} from "../../../Stores/QueriesPanelStore";
import type {ModalHandler} from "../../../Components/ModalTypes";

const name = ref("");

async function saveQuery(handler: ModalHandler) {
	if (name.value.trim() === "") {
		return;
	}
	try {
		handler.startProcessing();

		await SaveQuery(name.value);

		name.value = "";

		handler.done();
	} catch (e) {
		handler.finishProcessing();
		handler.showError(e);
	}
}
</script>

