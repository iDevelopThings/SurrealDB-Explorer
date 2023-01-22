<template>
	<div
		class="bg-main-700 border-l-4 border-b border-b-main-500"
		@click="table.select(item)"
		:class="[
			(table.isSelected(item) ? 'border-l-blue-500' : 'border-l-transparent'),
		]"
	>
		<JsonViewer
			:key="item.id.toString()"
			ref="jsonViewer"
			:value="item"
			sort
			expanded
			:expand-depth="3"
			theme="dark"
		>
			<template #actions>
				<div class="flex flex-row items-center space-x-4">
					<a
						ref="copyBtn"
						href="javascript:;"
						@click="copyable.isCopied() ? undefined : copyable.copy()"
						class="py-2 transition flex  flex-row items-center transition hover:text-main-200"
					>
						<template v-if="copyable.isCopied()">
							<ClipboardDocumentCheckIcon class="w-5 mr-1" />
							Copied
						</template>
						<template v-else>
							<ClipboardDocumentIcon class="w-5 mr-1" />
							Copy
						</template>

					</a>


					<ConfirmButton
						:action="deleteItem"
						class="flex flex-row items-center"
						confirm-classes="z-10 bg-main-600 py-1 py-2 text-xs"
						:confirm-icon="CheckIcon"
						message=""
					>
						<a href="javascript:;" class="py-2 transition flex flex-row items-center transition hover:text-main-200">
							<TrashIcon class="w-5" />
						</a>
					</ConfirmButton>

					<a
						href="javascript:;"
						@click="$modals.show('table:edit-entry', {table: table, item: item})"
						class="py-2 transition flex flex-row items-center transition hover:text-main-200"
					>
						<PencilIcon class="w-5" />
					</a>
				</div>
			</template>
		</JsonViewer>

	</div>
</template>

<script setup lang="ts">
import JsonViewer from "../../Services/JsonViewer/Components/json-viewer.vue";
import {PencilIcon, TrashIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon} from "@heroicons/vue/24/outline";
import {CheckIcon} from "@heroicons/vue/24/solid";
import {CopyableSection, useCopyable} from "vue-frontend-utils";
import {ref, computed} from "vue";
import ConfirmButton from "../../Components/ConfirmButton.vue";
import {tableStore} from "../../Stores/TableStore";

const props = defineProps<{
	tableName: string,
	item: any,
}>();


const table = computed(() => {
	return tableStore.get(props.tableName);
});

const copyBtn = ref<HTMLElement>();

const copyable = useCopyable(copyBtn, {
	valueGetter    : () => props.item,
	processContent : (content) => JSON.stringify(content, null, 2),
});

function deleteItem() {
	table.value.deleteProcessor.invoke(props.item.id);
}

</script>

