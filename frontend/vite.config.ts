import type {Plugin} from "vite";
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {ClassStoresPlugin} from "@idevelopthings/vue-class-stores/vite";
import {VueFrontendUtils} from "vue-frontend-utils/vite";
import resolveConfig from "tailwindcss/resolveConfig";
import {readFileSync} from "fs";
//@ts-ignore
import * as monacoEditorPlugin from "vite-plugin-monaco-editor";
//@ts-ignore
import * as fs from "fs";

const {version} = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig({
	plugins : [
		ClassStoresPlugin({
			// The src path where your stores will be located
			storesPath : "src/Stores",
			// The name of the generated typescript declaration file
			// stores.d.ts is the default
			storesFileName : "stores.d.ts",
		}),
		VueFrontendUtils({
			srcPathFromRoot : "src"
		}),
		//@ts-ignore
		monacoEditorPlugin.default.default({}),
		vue(),

		{
			name : "frontend-vite-plugin",

			async configResolved(config) {

				const conf = resolveConfig(await import("./tailwind.config.cjs"));

				function flattenObject(ob) {
					var toReturn = {};

					for (var i in ob) {
						if (!ob.hasOwnProperty(i)) continue;

						if ((typeof ob[i]) == "object" && ob[i] !== null) {
							var flatObject = flattenObject(ob[i]);
							for (var x in flatObject) {
								if (!flatObject.hasOwnProperty(x)) continue;

								toReturn[i + "." + x] = flatObject[x];
							}
						} else {
							toReturn[i] = ob[i];
						}
					}
					return toReturn;
				}

				const colors = flattenObject(conf.theme.colors);

				let file = `
export type ColorKeys = ${Object.keys(colors).map(c => `'${c}'`).join(" | ")};

export const colors = ${JSON.stringify(colors, null, 2)};
				`;

				await fs.promises.writeFile("./src/.generated/Colors.ts", file);
			}

		} as Plugin,
	],
	resolve : {
		alias : {
			"@" : "/src",
		},
	},
	define  : {
		"import.meta.env.APP_VERSION" : `"${version}"`,
	}
});
