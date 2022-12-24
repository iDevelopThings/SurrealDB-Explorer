import {editor, languages, type IDisposable} from "monaco-editor";
import * as monaco from "monaco-editor";
import {Theme} from "../Theme";
import {schemaStore} from "../../Stores/SchemaStore";
import {languageConfiguration, language} from "./LanguageConfiguration";
import {defineEvent, type RegisteredEvent} from "vue-frontend-utils";
import {ref} from "vue";

import {CommandsRegistry} from "monaco-editor/esm/vs/platform/commands/common/commands";

export const updateKeyBinding = (
	editor: any,
	id: string,
	newKeyBinding?: number | number[],
) => {
	editor._standaloneKeybindingService.addDynamicKeybinding(`-${id}`, undefined, () => {
	});

	if (newKeyBinding) {
		const {handler, when} = CommandsRegistry.getCommand(id) ?? {};
		if (handler) {
			editor._standaloneKeybindingService.addDynamicKeybinding(id, newKeyBinding, handler, when);
		}
	}
};
export const addKeyBinding    = (
	editor: any,
	id: string,
	newKeyBinding?: number | number[],
) => {
	const action = editor.getAction(id);
	editor._standaloneKeybindingService.addDynamicKeybinding(id, newKeyBinding, () => action.run(), undefined);
};

export type EditorTypes = "query";

export class EditorManager {

	public currentType: EditorTypes;
	public current: editor.IStandaloneCodeEditor;

	public onRun: RegisteredEvent<{ content: string }>;
	public onChange: RegisteredEvent<{ content: string }>;

	public monacoEvents: { [key: string]: IDisposable } = {};

	public content = ref<string>("");


	public async setup() {


		this.onRun    = defineEvent<{ content: string }>("editor:run");
		this.onChange = defineEvent<{ content: string }>("editor:change");

		monaco.editor.defineTheme("base", {
			base    : "vs-dark",
			inherit : true,
			rules   : [
				{token : "string", foreground : Theme.get("emerald.400")},
				{token : "keyword", foreground : Theme.get("violet.400")},
				{token : "param", foreground : Theme.get("blue.200")},
				{token : "comment", foreground : Theme.get("main.300")},
				{token : "operator", foreground : Theme.get("main.200")},
				{token : "predefined", foreground : Theme.get("blue.400")},
			],
			colors  : {
				"editor.background"                 : Theme.get("main.900"),
				"editorLineNumber.foreground"       : Theme.get("main.500"),
				"editorLineNumber.activeForeground" : Theme.get("main.500")
			}
		});

		monaco.languages.register({id : "surreal"});

		monaco.languages.setLanguageConfiguration("surreal", languageConfiguration);
		monaco.languages.setMonarchTokensProvider("surreal", language);

		monaco.editor.setTheme("base");

		monaco.languages.registerCompletionItemProvider("surreal", {
			triggerCharacters      : [" "],
			provideCompletionItems : (model, position) => {

				const textUntilPosition = model.getValueInRange({
					startLineNumber : position.lineNumber,
					startColumn     : 1,
					endLineNumber   : position.lineNumber,
					endColumn       : position.column
				});

				const suggestions: languages.CompletionItem[] = [];

				const match      = textUntilPosition.match(/(\S+)$/);
				const matchValue = match ? match[0].toLowerCase() : "";


				const tableNameMatches = /FROM (\w+)/.exec(model.getLineContent(position.lineNumber));


				if (tableNameMatches?.length) {
					const tableName = tableNameMatches[1];
					const table     = schemaStore.$tables.find(t => t.name === tableName);


					if (table) {
						table.getFields().forEach(column => {
							if (column.name.toLowerCase().indexOf(matchValue) === 0) {
								suggestions.push({
									label      : column.name,
									kind       : monaco.languages.CompletionItemKind.Field,
									insertText : column.name,
									detail     : column.type,
									range      : {
										startLineNumber : position.lineNumber,
										startColumn     : position.column - matchValue.length,
										endLineNumber   : position.lineNumber,
										endColumn       : position.column
									}
								});
							}
						});
					}
				}


				const line = model.getLineContent(position.lineNumber).substring(0, position.column);
				if (line.toLowerCase().trim().endsWith("from")) {
					const tables = schemaStore.$tables.map(table => table.name);
					suggestions.push(...tables.map(table => ({
						label      : table,
						kind       : monaco.languages.CompletionItemKind.Class,
						insertText : table,
						range      : {
							startLineNumber : position.lineNumber,
							startColumn     : position.column - matchValue.length,
							endLineNumber   : position.lineNumber,
							endColumn       : position.column
						}
					})));
				}

				return {
					suggestions : suggestions,
				};
			}
		});
	}

	public get defaultOptions(): editor.IStandaloneEditorConstructionOptions {
		return {
			language             : "surreal",
			contextmenu          : true,
			scrollBeyondLastLine : false,
			overviewRulerLanes   : 0,
			fontFamily           : "JetBrains Mono",
			renderLineHighlight  : "none",
			lineDecorationsWidth : 12,
			lineNumbersMinChars  : 1,
			glyphMargin          : false,
			theme                : "base",
			automaticLayout      : true,
			quickSuggestions     : true,
			minimap              : {
				enabled : false
			}
		};
	}

	public init(el: HTMLElement, type: EditorTypes = "query") {

		this.currentType = type;
		this.current     = editor.create(el, this.defaultOptions);

		this.content.value = "";

		this.monacoEvents.onChange = this.current.getModel().onDidChangeContent((event) => {
			this.content.value = this.current.getValue();

			this.onChange.invoke({content : this.content.value});
		});

		this.setActions();
	}

	public setActions() {
		this.current.addAction({
			id          : "run",
			label       : "Run",
			keybindings : [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
			run         : () => this.onRun.invoke({content : this.current.getValue()})
		});

		updateKeyBinding(this.current, "editor.action.commentLine", monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash);
		updateKeyBinding(this.current, "editor.action.blockComment", monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Slash);

		// Insert cursor above/below(custom)
		updateKeyBinding(this.current, "editor.action.insertCursorAbove", monaco.KeyMod.Alt | monaco.KeyCode.UpArrow);
		updateKeyBinding(this.current, "editor.action.insertCursorBelow", monaco.KeyMod.Alt | monaco.KeyCode.DownArrow);

		addKeyBinding(this.current, "editor.action.quickCommand", monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP);
	}

	public dispose(): void {
		if (!this.current) return;

		this.current.dispose();

		for (let monacoEventsKey in this.monacoEvents) {
			this.monacoEvents[monacoEventsKey].dispose();
		}
	}

	public setValue(value: string): void {
		this.current.setValue(value);
	}

	public forceResize(): void {
		this.current.layout();
	}
}

export const Editor = new EditorManager();
