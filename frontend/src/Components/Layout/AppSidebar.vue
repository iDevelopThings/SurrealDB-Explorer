<template>

    <div
      class="h-full flex flex-col relative"
      :class="$app.$sidebarExpanded ? 'w-[16em]' : 'w-16'"
    >

        <UseMouseInElement
          v-slot="{ elementX, elementY, isOutside }"
          class="absolute right-0 top-0 h-full w-[6px] group border-r border-main-500 hover:border-r-2"
        >
            <a
              href="javascript:;"
              v-if="!isOutside"
              @click="$app.toggleSidebarExpanded()"
              class="absolute select-none cursor-pointer z-10 w-6 h-6 top-20 -left-2 flex flex-col items-center justify-center rounded-full bg-main-300 text-white"
            >
                <ChevronLeftIcon v-if="$app.$sidebarExpanded" class="w-4 h-4"/>
                <ChevronRightIcon v-if="!$app.$sidebarExpanded" class="w-4 h-4"/>
            </a>

        </UseMouseInElement>

        <div class="flex flex-row items-center justify-center w-full">
            <img :src="$app.$sidebarExpanded ? Logo : LogoIcon"
                 class="select-none"
                 :class="$app.$sidebarExpanded ? 'w-full px-6 py-3' : 'w-10 px-0 py-3'"
            />
        </div>

        <div
          class="h-full flex flex-col space-y-4"
          :class="[$app.$sidebarExpanded ? 'p-4' : 'p-2']"
        >
            <SidebarItem title="Connections" to="/" :icon="HomeIcon"/>

            <template v-if="$connection.current">
                <div class="bg-slate-500 h-[1px] w-full"></div>
                <SidebarItem title="SQL Query" to="/query" :icon="CircleStackIcon"/>
                <SidebarItem title="Tables" to="/tables" :icon="TableCellsIcon"/>
                <!--			<SidebarItem title="Logins" to="/logins" :icon="LockClosedIcon" />-->
                <!--			<SidebarItem title="Tokens" to="/tokens" :icon="FingerPrintIcon" />-->
                <!--			<SidebarItem title="Scopes" to="/scopes" :icon="Squares2X2Icon" />-->
            </template>
        </div>

	</div>

</template>

<script setup lang="ts">
import Logo from "./../../assets/images/SDBExplorerLogo.png";
import LogoIcon from "./../../assets/images/Icon.png";
import SidebarItem from "./SidebarItem.vue";
import {
    TableCellsIcon,
    HomeIcon,
    CircleStackIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import {ref} from "vue";
import {UseMouseInElement} from "@vueuse/components";


//const sidebarResize = ref<HTMLElement | null>(null);

//const resizeMouseData = useMouseInElement(sidebarResize, {
//    handleOutside : true,
//});

</script>

