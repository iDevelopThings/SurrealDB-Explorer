<template>
	<!--@click="$queryPage.toggleResultPanel()"-->
    <div
      class="border-b select-none flex flex-row items-center justify-between border-b-main-500 w-full px-6 transition"
    >
        <div class="py-2 flex flex-row items-center space-x-4 justify-between w-full">
            <p class="text-sm text-main-100">Query Result</p>
            <div class="flex flex-row items-center space-x-4">
                <template v-if="$queryPage.isProcessing">
                    <Spinner class="w-4 h-4"/>
                </template>
                <div class="flex flex-row items-center space-x-4" v-else-if="!$queryPage.$result?.queryResult">
		                <p class="text-sm text-main-200">No query results</p>
                </div>
                <div class="flex flex-row items-center space-x-4" v-else>
                    <div class="flex flex-row items-center space-x-2">
                        <TableCellsIcon class="w-5 h-5 text-main-300"/>
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
        </div>
        <!--<ChevronDownIcon class="w-5 h-5 text-white" :class="[$queryPage.resultPanelExpanded ? 'rotate-180' : '']"/>-->
    </div>
</template>

<script setup lang="ts">
import {Spinner} from "vue-frontend-utils";
import {TableCellsIcon, ClockIcon} from "@heroicons/vue/24/outline";

</script>

