<template>
	<TransitionRoot as="template" :show="modal.isOpen()">
		<Dialog as="div" class="relative z-10" @close="modal.hide()">
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
										Create new <span class="font-semibold tracking-wide text-main-100">{{ table.title }}</span>
									</DialogTitle>
									<div class="ml-3 flex h-7 items-center">
										<button
											type="button"
											class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
											@click="modal.hide()"
										>
											<span class="sr-only">Close</span>
											<XMarkIcon class="h-6 w-6" aria-hidden="true" />
										</button>
									</div>
								</div>
							</div>

							<div class="relative mt-6 flex-1 px-4 sm:px-6 ">
								<JsonEditorVue
									ref="jsonEditorVueRef"
									class="jse-theme-dark min-h-full h-full"
									mode="text"
									:mainMenuBar="false"
									:navigation-bar="false"
									v-model="value"
								/>

							</div>

							<div class="border-t border-main-500 relative mt-6 px-4 sm:px-6 pt-6">
								<div class="flex justify-end">
									<SpinnerButton
										class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold tracking-wide rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-0"
										@click="creator.invoke()"
										:spin="creator.processing"
									>
										Create
									</SpinnerButton>
								</div>
							</div>
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>

</template>

<script lang="ts" setup>
import {ModalRegistration} from "vue-frontend-utils";
import {TableViewer} from "../../Stores/TableViewer";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import {XMarkIcon} from "@heroicons/vue/24/outline";
import JsonEditorVue from "json-editor-vue";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
import {ref, onMounted, watch, onUnmounted} from "vue";

import {SpinnerButton} from "vue-frontend-utils";
import {Async} from "../../Services/AsyncProcessor";

const props = defineProps<{
	table: TableViewer,
	modal: ModalRegistration,
}>();

const value = ref({});

const jsonEditorVueRef = ref();

const unsubscribe = watch(jsonEditorVueRef, (jsonEditorVue, oldValue) => {
	if (!oldValue && jsonEditorVue) {
		onInit();
	}
});

function onInit() {
//	jsonEditorVueRef.value.jsonEditor.value.focus();
}

const creator = Async(async () => {
	const jsonData = JSON.parse(jsonEditorVueRef.value.jsonEditor.get().text);
	const result = await props.table.createNewEntry(jsonData);
	value.value = {};
	return result;
});


onUnmounted(() => unsubscribe());


</script>

<style>
.panel-shadow {
	box-shadow: -25px 0 40px -5px rgb(0 0 0 / 20%), -8px 0 10px -6px rgb(0 0 0 / 10%);
}
</style>

<!--
{
    "account_type": "couple",
	"username": "testing_user"
}

-->
