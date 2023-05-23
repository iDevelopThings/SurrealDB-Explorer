<template>
	<div class="w-full max-w-[13em] bg-main-800 divide-y divide-slate-600 overflow-y-auto">
    <div class="flex flex-col  justify-center">
      <p class="py-3 px-6 text-lg">Tables</p>
    </div>
    <div class="flex flex-col divide-y divide-slate-600">

      <template v-if="schemaStore.isLoading">
        <Spinner/>
      </template>
      <template v-else>
        <!--					@click.native="tableStore.load(table)"-->
				<TableSidebarItem
					:title="table.title"
					:to="{name: 'tables.view', params: {name: table.name}}"
					v-for="table in schemaStore.tables"
				/>
			</template>

		</div>
	</div>
</template>

<script setup lang="ts">
import {schemaStore} from "../../Stores/SchemaStore";
import TableSidebarItem from "./TableSidebarItem.vue";
import {tableStore} from "../../Stores/TableStore.js";
import Spinner from "../../Components/Spinner.vue";
</script>

