<template>
	<div class="flex flex-col w-full bg-main-800 rounded overflow-hidden shadow">

		<div class="flex flex-row items-center justify-center bg-red-500 px-3 py-1.5" v-if="connectionError">
			<p class="text-white font-semibold tracking-wide">{{ connectionError }}</p>
		</div>

		<div class="p-6 flex flex-row justify-between w-full">
			<div>

				<div class="flex flex-col">
					<p class="text-lg font-bold tracking-wide text-main-100">
						{{ connection.name }} <span class="text-xs font-bold text-main-200">({{ connection.host }})</span>
					</p>
				</div>

				<div class="flex flex-row items-center space-x-4 mt-2">
					<p class="text-sm">
						<span class="font-semibold tracking-wide text-main-200 text-xs">User: </span>
						<span class="font-bold text-main-100">{{ connection.user }}</span>
					</p>
					<p class="text-sm">
						<span class="font-semibold tracking-wide text-main-200 text-xs">NS: </span>
						<span class="font-bold text-main-100">{{ connection.namespace }}</span>
					</p>
					<p class="text-sm">
						<span class="font-semibold tracking-wide text-main-200 text-xs">DB: </span>
						<span class="font-bold text-main-100">{{ connection.database }}</span>
					</p>
				</div>
			</div>

			<div class="flex flex-col items-center justify-center">
				<SpinnerButton
					:spin="$connection.$connecting === connection.id"
					v-if="$connection.$current?.id !== connection.id"
					@click="connect"
					class="inline-flex bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded"
				>
					Connect
				</SpinnerButton>

				<SpinnerButton
					v-if="$connection.$current?.id === connection.id"
					@click="$connection.disconnect()"
					class="inline-flex bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded"
				>
					Disconnect
				</SpinnerButton>

				<SpinnerButton
					class="inline-flex bg-main-500 hover:bg-main-600 text-white font-semibold py-1.5 px-4 rounded mt-2"
					@click="remove.invoke(connection)"
					:loading="remove.processing"
				>
				<span v-if="remove.confirmMessage">
					{{ remove.confirmMessage }}
				</span>
					<span v-else>Remove</span>
				</SpinnerButton>


			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import {Config} from "../../../wailsjs/go/models";
import {SpinnerButton} from "vue-frontend-utils";
import {ConfirmedAsyncFunc} from "../../Services/AsyncProcessor";
import {connectionStore} from "../../Stores/ConnectionStore";
import {Remove} from "../../../wailsjs/go/Config/Connections";
import {ref} from "vue";

const props = defineProps<{
	connection: Config.Connection
}>();

const connectionError = ref<string>(null);


const remove = ConfirmedAsyncFunc<[Config.Connection]>(async (handler, connection: Config.Connection) => {
	if (!handler.isConfirmed) {
		handler.askConfirm("Confirm delete");
		return;
	}

	connectionStore.state.connections = await Remove(connection.id);
});

let timeout = null;

function clearConnectionError() {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
	connectionError.value = null;
}

async function connect() {
	if (timeout) {
		clearConnectionError();
	}

	if (await connectionStore.connect(props.connection)) {
		return;
	}

	connectionError.value = "Failed to connect to rpc socket";

	timeout = setTimeout(() => {
		connectionError.value = null;
	}, 4000);
}

</script>

