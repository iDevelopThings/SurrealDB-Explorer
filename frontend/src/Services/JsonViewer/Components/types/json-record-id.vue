<script lang="ts">
// const REG_LINK = /^\w+:\/\//;
import {Thing} from "../../../Database/Thing";

const REG_LINK = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
import {h, defineComponent, render, compile} from "vue";
import ThingField from "../../../../Pages/Tables/Fields/ThingField.vue";
import {RouterLink} from "vue-router";
import {tableStore} from "../../../../Stores/TableStore";

export default defineComponent(({
	name  : "JsonRecordId",
	props : {
		jsonValue : {
			type     : Thing,
			required : true
		}
	},
	data() {
		return {
			expand    : true,
			canExtend : false,
		};
	},
	mounted() {
		if (this.$refs.itemRef.offsetHeight > this.$refs.holderRef.offsetHeight) {
			this.canExtend = true;
		}
	},
	methods : {
		toggle() {
			this.expand = !this.expand;
		}
	},
	render() {
		let value: Thing = this.jsonValue;

		const raw = `
<RouterLink to="{name: 'tables.view', params: {name: ${value.table}, id: ${value.toString()}}}">
	<span class="bg-blue-500 text-white rounded overflow-hidden inline-flex items-center">
		<span class="font-semibold tracking-wide px-2 py-0.5 text-xs">
			${value.table}
		</span>
		<span class="text-white bg-slate-100 font-semibold text-gray-900 px-2">
			${value.id}
		</span>
	</span>
</RouterLink>`;

		const link = h("a", {
			href    : "javascript:;",
			class   : {
				"jv-item"      : true,
				"jv-record-id" : true,
			},
			ref     : "itemRef",
			onClick : () => {
				tableStore.viewEntry(value);
				console.log("click", this);
			}
		}, [
			h("span", {
				class : "bg-blue-500 text-white rounded overflow-hidden inline-flex items-center"
			}, [
				h("span", {
					class : "font-semibold tracking-wide px-2 py-0.5 text-xs"
				}, value.table),
				h("span", {
					class : "text-white bg-slate-100 font-semibold text-gray-900 px-2"
				}, value.id)
			])
		]);

		let domItem: any = {
			class     : {
				"jv-item"      : true,
				"jv-record-id" : true,
			},
			ref       : "itemRef",
			innerHTML : raw,
		};

		return h("span", {}, [
			h("span", {
				class : {
					"jv-holder-node" : true,
				},
				ref   : "holderRef"
			}),
			link,
			//h("span", domItem)
		]);
	}
}));
</script>
