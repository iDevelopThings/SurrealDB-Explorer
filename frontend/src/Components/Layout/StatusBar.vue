<template>

	<div class="border-t border-t-main-500 px-3 py-2 flex flex-row">

		<div class="flex flex-row items-center space-x-1">
			<span class="text-xs tracking-wide font-semibold text-main-200">Current Connection:</span>

			<div>
				<div class="flex space-x-1.5 flex-row items-center font-bold tracking-wide text-main-100">
					<div
						class="w-3 h-3 rounded-full"
						:class="[$connection.current ? 'bg-green-500' : 'bg-red-500']"
					></div>
					<span class="text-xs">{{ $connection.current?.name || 'None' }}</span>
					<span v-if="$connection.current" class="text-xs font-bold text-main-200">({{ $connection.current?.host }})</span>
				</div>

			</div>
		</div>

	</div>

</template>

<script setup lang="ts">

</script>

