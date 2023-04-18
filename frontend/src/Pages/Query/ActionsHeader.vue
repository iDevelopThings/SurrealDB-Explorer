<template>
	<div class="flex flex-row items-center justify-between w-full border-b border-b-main-500 px-6 py-4">

		<div class="flex flex-row items-center space-x-4">
			<SimpleButton
				@click="$queryPage.toggleQueriesPanel()"
				:icon="CircleStackIcon"
				class="text-white font-semibold py-1.5 px-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Queries
			</SimpleButton>
			<SimpleButton
				@click="$queryPage.toggleRawResponse()"
				:icon="$queryPage.$viewRawResponse ? EyeIcon : EyeSlashIcon"
				class="text-white font-semibold py-1.5 px-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Toggle Raw Response
			</SimpleButton>
		</div>

		<div class="flex flex-row items-center space-x-4">
        <SimpleButton
	        @click="$queryPage.toggleLayout()"
          :icon="$queryPage.$layout === 'horizontal' ? ViewColumnsIcon : QueueListIcon"
          :icon-class="{hover: 'text-white', default: 'text-main-300'}"
          class="bg-main-500 hover:bg-main-600 text-white font-semibold py-1.5 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <template v-if="$queryPage.$layout === 'horizontal'">
                Columns
            </template>
            <template v-else>
                Rows
            </template>
        </SimpleButton>

        <SimpleButton
          @click="$modals.show('queries:save')"
          class="bg-main-500 hover:bg-main-600 text-white font-semibold py-1.5 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
            Save Query
        </SimpleButton>

        <SimpleButton
          :icon="PlayIcon"
          :loading="$queryPage.$running"
          @click="$queryPage.runQuery()"
          :icon-class="{hover: 'text-white', default: 'text-main-300'}"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
            Run Query
        </SimpleButton>

    </div>

	</div>

</template>

<script setup lang="ts">
import SimpleButton from "../../Components/SimpleButton.vue";
import {PlayIcon, CircleStackIcon, EyeIcon, EyeSlashIcon, ViewColumnsIcon, QueueListIcon} from "@heroicons/vue/24/outline";

</script>

