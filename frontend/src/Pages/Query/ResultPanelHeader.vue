<template>
	<div
		@click="$queryPage.toggleResultPanel()"
		class="border-b flex flex-row items-center justify-between select-none border-b-main-500 w-full cursor-pointer hover:bg-main-800 px-6 transition"
	>
		<div class="py-2 flex flex-row items-center space-x-4">
			<p class="text-sm text-main-200">Query Result</p>
			<template v-if="$queryPage.isProcessing">
				<Spinner class="w-4 h-4" />
			</template>
			<div class="flex flex-row items-center space-x-4" v-else-if="$queryPage.$result?.queryResult">
				<div class="flex flex-row items-center space-x-2">
					<TableCellsIcon class="w-5 h-5 text-main-300" />
					<p class="text-sm text-main-200">{{ $queryPage.$result.queryResult.itemCount }} Items</p>
				</div>

				<div class="flex flex-row items-center space-x-2">
					<ClockIcon
						class="w-5 h-5 text-main-300"
						:class="{
							'text-green-400':$queryPage.$result.queryResult.isFast,
							'text-yellow-400':$queryPage.$result.queryResult.isMedium,
							'text-red-400':$queryPage.$result.queryResult.isSlow
						}"
					/>
					<p
						class="text-sm text-main-200"
						:class="{
							'text-green-500':$queryPage.$result.queryResult.isFast,
							'text-yellow-500':$queryPage.$result.queryResult.isMedium,
							'text-red-500':$queryPage.$result.queryResult.isSlow
						}"
					>
						{{ $queryPage.$result.queryResult.timeTaken }}
					</p>
				</div>
			</div>
		</div>
		<ChevronDownIcon class="w-5 h-5 text-white" :class="[$queryPage.resultPanelExpanded ? 'rotate-180' : '']" />
	</div>
</template>

<script setup lang="ts">
import {ChevronDownIcon} from "@heroicons/vue/24/solid";
import {Spinner} from "vue-frontend-utils";
import {TableCellsIcon, ClockIcon} from "@heroicons/vue/24/outline";

</script>

