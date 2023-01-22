import {getCurrentInstance, type ComponentInternalInstance, onMounted, onUnmounted, onBeforeUnmount} from "vue";

export function ifComponent(fn: (comp: ComponentInternalInstance) => void | Promise<void>) {
	const comp = getCurrentInstance();
	if (comp) {
		fn(comp);
	}
}

export function useSafeOnMounted(fn: () => void | Promise<void>) {
	ifComponent(comp => {
		onMounted(fn, comp);
	});
}

export function useSafeOnUnmounted(fn: () => void | Promise<void>) {
	ifComponent(comp => {
		onUnmounted(fn, comp);
	});
}

export function useSafeOnBeforeUnmount(fn: () => void | Promise<void>) {
	ifComponent(comp => {
		onBeforeUnmount(fn, comp)
	});
}
