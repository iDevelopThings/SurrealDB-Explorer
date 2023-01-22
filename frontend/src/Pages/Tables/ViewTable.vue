<template>
	<div class="max-h-screen h-full w-full ">
		<div class="flex flex-col w-full h-full">

			<div ref="header" class="bg-main-700 border-b border-b-main-500 w-full">
				<TableActions :table="table" />
				<TableFilters :table="table" />
			</div>

			<div
				ref="content"
				class="flex flex-col w-full h-full overflow-y-auto relative"
				:style="{'max-height': contentHeight}"
			>

				<div
					v-show="table.shouldShowError"
					ref="particlesEl"
					class="w-full h-full absolute overflow-hidden"
					:id="`${table.schema.name}:confetti`"
					:key="`${table.schema.name}:confetti`"
				></div>

				<TableSelectingItemsBanner :table="table" />

				<div v-if="table.loading" class="flex flex-col items-center justify-center text-center py-12 space-y-3">
					<Spinner />
					<p class="text-main-300 text-sm font-semibold">Loading {{ name }} entries...</p>
				</div>

				<div v-else-if="table.shouldShowError" class="w-full h-full">
					<TableError :table="table" />
				</div>

				<template v-else>
					<ViewTableEntry
						v-for="item in table.entries"
						:item="item"
						:tableName="name"
					/>
				</template>
			</div>

			<TableFooter :table="table" />
		</div>
	</div>
</template>

<script setup lang="ts">
import {tableStore} from "@/Stores/TableStore";
import {ref, computed, onMounted, onBeforeUnmount, onDeactivated, onActivated, onBeforeMount} from "vue";
import {Thing} from "@/Services/Database/Thing";
import {useElementSize, useEventBus} from "@vueuse/core";
import TableFilters from "./TableFilters.vue";
import Spinner from "../../Components/Spinner.vue";
import TableActions from "./Sections/TableActions.vue";
import TableSelectingItemsBanner from "./Sections/TableSelectingItemsBanner.vue";
import TableError from "./Sections/TableError.vue";
import ViewTableEntry from "./ViewTableEntry.vue";
import TableFooter from "./Sections/TableFooter.vue";
import {useParticles, type UseParticlesReturn} from "@/Services/Confetti/Confetti";
import {tablesErrorBus} from "@/Services/TableViewer/TableViewer";

const props = defineProps<{
	name: string,
	id?: Thing
}>();


const particlesEl = ref<HTMLDivElement>();
const header      = ref<HTMLDivElement>();
const content     = ref<HTMLDivElement>();
const footer      = ref<HTMLDivElement>();

const headerSize = useElementSize(header);
const footerSize = useElementSize(footer);

const contentHeight = computed(() => {
	return `calc(100vh - (${headerSize.height}px - ${footerSize.height}px))`;
});

tableStore.tryLoad(props);

const table = computed(() => tableStore.get(props.name));

let particles: UseParticlesReturn;
let offTableErrorBus: () => void;

onBeforeMount(() => {
	offTableErrorBus = tablesErrorBus.on(async ({name, error}) => {
		if (name !== props.name) return;

		if (!particles) {
			particles = await useParticles(particlesEl.value, {
				fadeIn       : true,
				fadeOut      : true,
				fadeOutDelay : 75000,
			});
		}

		if (particles.isRunning()) {
			particles.stop(true);
		}

		particles.play();
	});
});

onBeforeUnmount(() => {
	if (offTableErrorBus) {
		offTableErrorBus();
	}

	if (particles) {
		particles.destroy();
	}
});

</script>

