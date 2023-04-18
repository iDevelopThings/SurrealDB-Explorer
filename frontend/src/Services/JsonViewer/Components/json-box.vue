<script lang="ts">
import JsonString from "./types/json-string.vue";
import JsonRecordId from "./types/json-record-id.vue";
import JsonUndefined from "./types/json-undefined.vue";
import JsonNumber from "./types/json-number.vue";
import JsonBoolean from "./types/json-boolean.vue";
import JsonObject from "./types/json-object.vue";
import JsonArray from "./types/json-array.vue";
import JsonFunction from "./types/json-function.vue";
import JsonDate from "./types/json-date.vue";
import JsonRegexp from "./types/json-regexp.vue";
import {h, defineComponent} from "vue";
import {Thing} from "../../Database/Thing";


export default defineComponent({
	name   : "JsonBox",
	inject : ["expandDepth", "keyClick"],
	props  : {
		value       : {
			type    : [Object, Array, String, Number, Boolean, Function, Date],
			default : null,
		},
		keyName     : {
			type    : String,
			default : "",
		},
		sort        : Boolean,
		depth       : {
			type    : Number,
			default : 0,
		},
		previewMode : Boolean,
	},
	data() {
		return {
			expand : true,
		};
	},
	mounted() {
		this.expand = this.previewMode || (this.depth < this.expandDepth);
	},
	methods  : {
		toggle() {
			this.expand = !this.expand;

			try {
				this.$el.dispatchEvent(new Event("resized"));
			} catch (e) {
				// handle IE not supporting Event constructor
				var evt = document.createEvent("Event");
				evt.initEvent("resized", true, false);
				this.$el.dispatchEvent(evt);
			}
		},
	},
	computed : {
		processedValue(): { value: any, isComplex: boolean | undefined } {
			let isComplex = undefined;

			if (this.value instanceof Thing) {
				isComplex = false;
			}

			return {value : this.value, isComplex : isComplex};
		}
	},
	render() {
		let elements = [];
		let dataType;

		let {value, isComplex} = this.processedValue;

		if (value === null || value === undefined) {
			dataType = JsonUndefined;
		} else if (value instanceof Thing) {
			dataType = JsonRecordId;
		} else if (Array.isArray(value)) {
			dataType = JsonArray;
		} else if (Object.prototype.toString.call(value) === "[object Date]") {
			dataType = JsonDate;
		} else if (typeof value === "object") {
			dataType = JsonObject;
		} else if (typeof value === "number") {
			dataType = JsonNumber;
		} else if (typeof value === "string") {
			dataType = JsonString;
		} else if (typeof value === "boolean") {
			dataType = JsonBoolean;
		} else if (typeof value === "function") {
			dataType = JsonFunction;
		}
		if (value?.constructor === RegExp) {
			// console.log("type", value.constructor === RegExp);
			// value=value.toString()
			dataType = JsonRegexp;
		}

		let complex = isComplex;
		if (complex === undefined) {
			complex = this.keyName &&
				value &&
				(Array.isArray(value) ||
					(typeof value === "object" &&
						Object.prototype.toString.call(value) !== "[object Date]"));
		}

		if (!this.previewMode && complex) {
			elements.push(
				h("span", {
					class   : {
						"jv-toggle" : true,
						open        : !!this.expand,
					},
					onClick : this.toggle,
				})
			);
		}

		if (this.keyName) {
			elements.push(
				h("span", {
					class     : {
						"jv-key" : true,
					},
					onClick   : () => {
						this.keyClick(this.keyName);
					},
					innerText : `${this.keyName}:`,
				})
			);
		}

		elements.push(
			h(dataType, {
				class             : {
					"jv-push" : true,
				},
				jsonValue         : value,
				keyName           : this.keyName,
				sort              : this.sort,
				depth             : this.depth,
				expand            : this.expand,
				previewMode       : this.previewMode,
				"onUpdate:expand" : (value) => {
					this.expand = value;
				},
			})
		);

		return h(
			"div",
			{
				class : {
					"jv-node"     : true,
					"jv-key-node" : Boolean(this.keyName) && !complex,
					toggle        : !this.previewMode && complex,
				},
			},
			elements
		);
	},
});
</script>

<style>
.jv-node {
	position: relative;
}

.jv-node:after {
	content: ",";
}

.jv-node:last-of-type:after {
	content: "";
}

.jv-node.toggle {
	margin-left: 13px !important;
}

.jv-node .jv-node {
	margin-left: 25px;
}
</style>
