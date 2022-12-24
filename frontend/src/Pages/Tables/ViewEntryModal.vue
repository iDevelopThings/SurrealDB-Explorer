<template>
	<TransitionRoot as="template" :show="viewer.entryViewer.open">
		<Dialog as="div" class="relative z-10" @close="viewer.closeEntryViewer()">
			<!--			<div class="fixed inset-0" />-->

			<!--			<div class="fixed inset-0 overflow-hidden">
							<div class="absolute inset-0 overflow-hidden">

							</div>
						</div>-->
			<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
				<TransitionChild
					as="template"
					enter="transform transition ease-in-out duration-500 sm:duration-700"
					enter-from="translate-x-full"
					enter-to="translate-x-0"
					leave="transform transition ease-in-out duration-500 sm:duration-700"
					leave-from="translate-x-0"
					leave-to="translate-x-full"
				>
					<DialogPanel class="pointer-events-auto w-screen max-w-md">
						<div class="flex h-full flex-col overflow-y-scroll bg-main-900 py-6 panel-shadow">
							<div class="px-4 sm:px-6">
								<div class="flex items-start justify-between">
									<DialogTitle class="text-lg font-medium text-main-200">
										{{ viewer.entryViewer.id }}
									</DialogTitle>
									<div class="ml-3 flex h-7 items-center">
										<button
											type="button"
											class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
											@click="viewer.closeEntryViewer()"
										>
											<span class="sr-only">Close</span>
											<XMarkIcon class="h-6 w-6" aria-hidden="true" />
										</button>
									</div>
								</div>
							</div>
							<div class="relative mt-6 flex-1 px-4 sm:px-6" v-if="viewer.entryViewer.value && !viewer.entryViewer.loading">
								<JsonViewer
									:value="viewer.entryViewer.value"
									copyable
									sort
									expanded
									:expand-depth="3"
									theme="dark"
								/>
							</div>
							<div class="relative mt-6 flex-1 px-4 sm:px-6" v-else>
								<Spinner />
							</div>
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import {XMarkIcon} from "@heroicons/vue/24/outline";
import {tableStore} from "../../Stores/TableStore.js";
import JsonViewer from "../../Services/JsonViewer/Components/json-viewer.vue";
import {TableViewer} from "../../Stores/TableViewer";
import Spinner from "../../Components/Spinner.vue";

const props = defineProps<{
	viewer: TableViewer
}>();
</script>

<style>
.panel-shadow {
	box-shadow: -25px 0 40px -5px rgb(0 0 0 / 20%), -8px 0 10px -6px rgb(0 0 0 / 10%);
}
</style>
