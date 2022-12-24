import {type Ref} from "vue";

export type ModalType = "danger" | "info" | "success";

export interface ModalHandler {
	isProcessing: Ref<boolean>,

	close(): void,
	setProcessing(processing: boolean): void,
	startProcessing(): void,
	finishProcessing(): void,

	showError(error: string | Error): void,
	resetError(): void,

	done():void;
}
