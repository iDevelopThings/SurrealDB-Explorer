<template>
	<TransitionRoot as="template" :show="modal.isOpen()">
		<Dialog as="div" class="relative z-10" @close="modal.hide()">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-main-500 bg-opacity-75 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 overflow-y-auto">
				<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<TransitionChild
						as="template"
						enter="ease-out duration-300"
						enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enter-to="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leave-from="opacity-100 translate-y-0 sm:scale-100"
						leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					>
						<DialogPanel
							:class="[{'px-4 pt-5 pb-4 sm:p-6' : noPadding !== true}]"
							class="relative transform overflow-hidden rounded-lg bg-main-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm"
						>
							<component :is="wrapperType">
								<div class="relative pb-4">
									<div
										v-if="error"
										class="bg-red-500 text-white font-semibold tracking-wide px-4 py-2.5"
										:class="{
											'rounded-b-none mx-4 mt-2 mb-2': noPadding !== true,
											'': noPadding === true
										}"
									>
										<p>{{ error }}</p>
									</div>

									<div
										v-if="isProcessing"
										class="absolute top-0 left-0 w-full h-full bg-main-500 bg-opacity-50 flex items-center justify-center"
									>
										<Spinner class="w-6 h-6" />
									</div>
									<div v-if="$slots.body === undefined">
										<div
											v-if="iconComponent"
											class="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
											:class="[
											{
												'bg-green-100': modalType === 'success',
												'bg-red-100': modalType === 'danger',
												'bg-indigo-100': modalType === 'info',
											},
										]"
										>
											<component
												:is="iconComponent"
												class="h-6 w-6"
												:class="[
												{
													'text-green-600': modalType === 'success',
													'text-red-600': modalType === 'danger',
													'text-indigo-600': modalType === 'info',
												},
											]"
											/>
										</div>
										<div class="mt-3 text-center sm:mt-5">
											<DialogTitle as="h3" v-if="$slots.title" class="text-lg font-medium leading-6 text-main-200">
												<slot name="title" />
											</DialogTitle>
											<div class="mt-2">
												<slot name="content" />
											</div>
										</div>
									</div>
									<slot v-else name="body">

									</slot>
								</div>
								<div class="px-4 py-5 border-t border-t-main-500  sm:flex sm:flex-row-reverse">
									<button
										type="button"
										:disabled="isProcessing"
										class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
										@click="confirmClicked"
										:class="[
											{
												'cursor-not-allowed disabled:bg-opacity-50': isProcessing,
											},
											{
												'bg-red-600 hover:bg-red-700 focus:ring-red-500': modalType === 'danger',
												'bg-green-600 hover:bg-green-700 focus:ring-green-500': modalType === 'success',
												'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500': modalType === 'info',
											},
										]"
									>
										<template v-if="isProcessing">
											<Spinner class="w-5 h-5 mr-2" />
										</template>
										{{ confirmTitle }}
									</button>
									<button
										type="button"
										class="mt-3 inline-flex w-full justify-center rounded-md px-4 py-2 text-base font-medium text-main-200 shadow-sm hover:text-main-100 hover:bg-main-700 transition sm:mt-0 sm:w-auto sm:text-sm"
										@click="cancelClicked"
									>
										{{ cancelTitle }}
									</button>
								</div>
							</component>
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script lang="ts" setup>
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import {CheckIcon, XMarkIcon, InformationCircleIcon} from "@heroicons/vue/24/outline";
import {type ModalRegistration, type IModalRegistration} from "vue-frontend-utils";
import {ref, computed, onUnmounted, h} from "vue";
import {Spinner} from "vue-frontend-utils";
import {type ModalHandler, type ModalType} from "./ModalTypes";


const props = withDefaults(defineProps<{
	modal: ModalRegistration | IModalRegistration,
	cancelTitle?: string,
	confirmTitle: string,
	modalType?: ModalType,
	icon?: any,
	hideIcon?: boolean,
	noPadding?: boolean,

	useForm?: boolean,
}>(), {
	cancelTitle : "Cancel",
	modalType   : "info",
});

const emits = defineEmits<{
	(event: "confirmed", handler: ModalHandler): void,
	(event: "cancelled", handler: ModalHandler): void,
}>();

const isProcessing = ref(false);
const error        = ref<string>(null);

const iconComponent = computed(() => {
	if (props.hideIcon) return null;

	if (props.icon) {
		return props.icon;
	}

	switch (props.modalType) {
		case "danger":
			return XMarkIcon;
		case "info":
			return InformationCircleIcon;
		case "success":
			return CheckIcon;
	}
});

const wrapperType = computed(() => {
	if (props?.useForm) {
		return h("form", {
			onSubmit : (e) => {
				e.preventDefault();
				confirmClicked();
			}
		});
	}

	return h("div");
});

const unsubscribe = props.modal.whenClosed(() => {
	isProcessing.value = false;
	error.value        = null;
});

onUnmounted(() => {
	unsubscribe();
});

function close() {
	props.modal.hide();
}

function setProcessing(processing: boolean) {
	isProcessing.value = processing;
}

function startProcessing() {
	setProcessing(true);
}

function finishProcessing() {
	setProcessing(false);
}

function showError(e: string | Error) {
	error.value = e instanceof Error ? e.message : e;
}

function resetError() {
	error.value = null;
}

function done() {
	this.close();
	this.finishProcessing();
}

function getHandler(): ModalHandler {
	return {
		isProcessing,
		close,
		setProcessing,
		startProcessing,
		finishProcessing,
		showError,
		resetError,
		done,
	};
}

function confirmClicked() {
	emits("confirmed", getHandler());
}

function cancelClicked() {
	close();
	emits("cancelled", getHandler());
}

</script>
