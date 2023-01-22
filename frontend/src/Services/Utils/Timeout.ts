import {ref, getCurrentInstance, onBeforeUnmount} from "vue";
import {useSafeOnBeforeUnmount} from "@/Services/Utils/Vue";


export function asyncTimeout(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function useTimeout(fn: Function, ms: number) {
	const timeout = ref<number>(null);

	function start() {
		if (timeout.value) {
			return;
		}
		timeout.value = setTimeout(fn, ms);
	}

	function setTime(newMs: number) {
		ms = newMs;
	}

	function stop() {
		if (!timeout.value) {
			return;
		}
		clearTimeout(timeout.value);
		timeout.value = null;
	}

	const comp = getCurrentInstance();
	if (comp) {
		onBeforeUnmount(stop, comp);
	}

	return {
		start,
		stop,
		setTime,
	};
}

export function useDebounce(fn: Function, ms: number) {
	const timeout = ref<number>(null);

	function start() {
		if (timeout.value) {
			clearTimeout(timeout.value);
		}
		timeout.value = setTimeout(fn, ms);
	}

	function stop() {
		if (!timeout.value) {
			return;
		}
		clearTimeout(timeout.value);
		timeout.value = null;
	}

	useSafeOnBeforeUnmount(stop);

	return {
		start,
		stop,
	};
}
