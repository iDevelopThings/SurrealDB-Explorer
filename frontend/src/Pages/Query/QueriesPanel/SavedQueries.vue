<template>

	<div class="flex flex-col p-4 space-y-4 overflow-y-auto">
		<div v-if="loadSavedQueries.isProcessing()" class="flex flex-col items-center justify-center">
			<Spinner class="w-6 h-6" />
		</div>
		<template v-else>
			<div v-if="!$queriesPanel.saved?.length">
				<p class="text-main-200 font-semibold text-lg text-center">No saved queries</p>
				<p class="text-main-300 mt-2 text-sm text-center">Write a query on the right, and hit <strong>Save Query</strong>, then it'll be here for future use!</p>
			</div>

			<div
				v-for="query in $queriesPanel.saved"
				class="bg-main-700 rounded shadow relative"
			>

				<div class="flex flex-row items-center relative">
					<p class="font-semibold tracking-wide text-main-200 px-4 py-3">
						{{ query.title }}
					</p>
					<a href="javascript:;" class="absolute right-4 z-10" @click="$queriesPanel.deleteSaved(query)">
						<TrashIcon v-if="!query._deleting" class="w-5 h-5 text-main-300 hover:text-main-200 transition" />
						<Spinner v-else class="w-5 h-5 text-main-300" />
					</a>
				</div>
				<div class="bg-torchlight w-full py-3">
					<div class="w-full torchlight bg-torchlight">
						{{ query.sql }}
					</div>

					<ConfirmButton
						:action="load(query)"
						class="absolute right-1 bottom-1 z-10 flex flex-row items-end"
						confirm-classes="z-10 bg-main-600 py-1 py-2 text-xs"
						message="Confirm"
					>
						<SimpleButton class="z-10 bg-main-600 py-1 py-2 text-xs">
							Load
						</SimpleButton>
					</ConfirmButton>
				</div>

			</div>
		</template>
	</div>


</template>

<script setup lang="ts">
import {loadSavedQueries} from "../../../Stores/QueriesPanelStore";
import {Spinner} from "vue-frontend-utils";
import {connectionStore} from "../../../Stores/ConnectionStore";
import {TrashIcon} from "@heroicons/vue/24/solid";
import SimpleButton from "../../../Components/SimpleButton.vue";
import ConfirmButton from "../../../Components/ConfirmButton.vue";
import {Editor} from "../../../Services/Monaco/Editor";

loadSavedQueries.start(connectionStore.$current.id);

function load(query) {
	return () => {
		Editor.setValue(query.sql);
	};
}

</script>

