<template>
	<div class="flex flex-col space-y-4 bg-main-800 rounded shadow overflow-hidden">
		<div
			class="cursor-pointer p-6 flex flex-row items-center justify-between select-none"
			:class="[$connection.$addPanelExpanded ? 'border-b border-b-main-500' : '']"
			@click="$connection.$addPanelExpanded = !$connection.$addPanelExpanded"
		>
			<p class="text-2xl text-main-200">
				Add Connection
			</p>

			<ChevronDownIcon class="w-6 text-main-200 transition " :class="[$connection.$addPanelExpanded ? 'rotate-180': '']" />
		</div>

		<form
			v-if="$connection.$addPanelExpanded"
			class="flex flex-col space-y-4 bg-main-800 rounded shadow p-6"
			@submit.prevent="$connection.addConnection.invoke(tempConnection)"
		>
			<div
				class="mb-8 bg-red-500 rounded shadow px-6 py-4"
				v-if="$connection.addConnection.errorMessage"
			>
				<p class="text-white font-semibold tracking-wide">{{ $connection.addConnection.errorMessage }}</p>
			</div>

			<div class="input-group">
				<label for="name">Name</label>
				<input autocomplete="false" required id="name" type="text" v-model="tempConnection.name" placeholder="Name" />
			</div>
			<div class="input-group">
				<label for="host">Host</label>
				<input autocomplete="false" required id="host" type="url" v-model="tempConnection.host" placeholder="Host" />
			</div>
			<div class="flex flex-row w-full space-x-6">
				<div class="input-group flex-1">
					<label for="user">User</label>
					<input autocomplete="false" required id="user" type="text" v-model="tempConnection.user" placeholder="User" />
				</div>
				<div class="input-group flex-1">
					<label for="pass">Password</label>
					<input autocomplete="false" required id="pass" type="text" v-model="tempConnection.pass" placeholder="Password" />
				</div>
			</div>
			<div class="flex flex-row w-full space-x-6">
				<div class="input-group flex-1">
					<label for="database">Database</label>
					<input autocomplete="false" required id="database" type="text" v-model="tempConnection.database" placeholder="Database" />
				</div>
				<div class="input-group flex-1">
					<label for="namespace">Namespace</label>
					<input autocomplete="false" required id="namespace" type="text" v-model="tempConnection.namespace" placeholder="Namespace" />
				</div>
			</div>

			<div class="flex flex-row items-center justify-end">
				<SpinnerButton
					type="submit"
					:spin="$connection.addConnection.processing"
					class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Add
				</SpinnerButton>
			</div>
		</form>
	</div>

</template>

<script setup lang="ts">
import {SpinnerButton} from "vue-frontend-utils";
import {ChevronDownIcon} from "@heroicons/vue/20/solid";
import {ref} from "vue";
import {Config} from "../../../wailsjs/go/models";


const addExpanded    = ref(false);
const tempConnection = ref<Config.Connection>(new Config.Connection({
	host      : "http://127.0.0.1:4269",
	user      : "root",
	pass      : "secret",
	database  : "test",
	namespace : "test",
	name      : "Test",
}));
</script>

