<script lang="ts">

import {defineComponent, h, reactive} from "vue";
import {ModalManager} from "vue-frontend-utils";

export default defineComponent({
	name : "ModalDrawer",

	render() {
		const modals = [];

		for (let modal of ModalManager.all) {
			if (!modal.isOpen()) continue;

			const modalComp = modal.component();
			if (modalComp === null) continue;

			const data       = modal.getProps();
			const extraProps = data.data || {};

			const comp = h(modalComp, {
				key   : modal.getTrigger(),
				modal : reactive(modal),
				//name   : data.name,
				//isOpen : data.isOpen,
				...extraProps,
			});

			modals.push(comp);
		}

		return h("div", modals);
	}
});

</script>

