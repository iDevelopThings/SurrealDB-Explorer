<template>

	<div class="w-[16em] w-full h-full flex flex-col space-y-4 px-6 py-10">

		<SidebarItem title="Connections" to="/" :icon="HomeIcon" />

		<template v-if="$connection.current">
			<div class="bg-slate-500 h-[1px] w-full"></div>
			<SidebarItem title="SQL Query" to="/query" :icon="CircleStackIcon" />
			<SidebarItem title="Tables" to="/tables" :icon="TableCellsIcon" />
<!--			<SidebarItem title="Logins" to="/logins" :icon="LockClosedIcon" />-->
<!--			<SidebarItem title="Tokens" to="/tokens" :icon="FingerPrintIcon" />-->
<!--			<SidebarItem title="Scopes" to="/scopes" :icon="Squares2X2Icon" />-->
		</template>

	</div>

</template>

<script setup lang="ts">
import SidebarItem from "./SidebarItem.vue";
import {TableCellsIcon, HomeIcon, CircleStackIcon, LockClosedIcon, FingerPrintIcon, Squares2X2Icon} from "@heroicons/vue/24/outline";
</script>

