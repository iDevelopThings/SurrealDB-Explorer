<template>
	<div class="flex flex-row items-center space-x-1">
		<span class="text-xs tracking-wide font-semibold text-main-200">Current Connection:</span>

		<div>
			<div class="flex space-x-1.5 flex-row items-center font-bold tracking-wide text-main-100">
				<template v-if="!$connection.$current">
					<ConnectionStatusDot :status="ConnectionStatus.Disconnected" />
					<span class="text-xs">None</span>
				</template>
				<template v-else>
					<ConnectionStatusDot :status="$connection.status" />

					<div
						class="text-xs tracking-wide"
						:class="{
							'text-opacity-50': $connection.$status === ConnectionStatus.Reconnecting
						}"
					>
						<span
							class="text-main-100"
							:class="{
								'text-opacity-50': $connection.$status === ConnectionStatus.Reconnecting
							}"
						>
							{{ $connection.current?.name || 'None' }}
						</span>
						<span
							v-if="$connection.current"
							class="font-bold text-main-200"
							:class="{
								'text-opacity-50': $connection.$status === ConnectionStatus.Reconnecting
							}"
						>
							({{ $connection.current?.host }})
						</span>

					</div>


				</template>


			</div>
		</div>
	</div>


</template>

<script setup lang="ts">

import ConnectionStatusDot from "./ConnectionStatusDot.vue";
import {ConnectionStatus} from "../../../Stores/ConnectionStore";
</script>
