import {editor, languages, type IDisposable, type Position, type CancellationToken} from "monaco-editor";
import * as monaco from "monaco-editor";
import {schemaStore} from "@/Stores/SchemaStore";
import {
	languageConfiguration,
	language,
	languageTheme,
	provideDocumentSemanticTokens,
	legend
} from "./LanguageConfiguration";
import {defineEvent, type RegisteredEvent} from "vue-frontend-utils";
import {ref} from "vue";

import {CommandsRegistry} from "monaco-editor/esm/vs/platform/commands/common/commands";
import {app} from "@/Stores/AppStore";
import {GetDocs} from "../../../wailsjs/go/backend/App";

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

export type EditorTypes = "query" | "create-entry" | "update-entry";

export class EditorManager {

	public currentType: EditorTypes;
	public current: editor.IStandaloneCodeEditor;

	public onRun: RegisteredEvent<{ content: string }>;
	public onChange: RegisteredEvent<{ content: string }>;

	public monacoEvents: { [key: string]: IDisposable } = {};

	public content = ref<string>("");

	constructor(type: EditorTypes) {
		this.currentType = type;
	}

	public static async configureEditor() {
		monaco.editor.defineTheme("base", languageTheme);

		monaco.languages.register({id: "surreal"});

		monaco.languages.setLanguageConfiguration("surreal", languageConfiguration);
		monaco.languages.setMonarchTokensProvider("surreal", language);
		monaco.languages.registerDocumentSemanticTokensProvider("surreal", {
			provideDocumentSemanticTokens: provideDocumentSemanticTokens,
			getLegend: (): languages.SemanticTokensLegend => legend,
			releaseDocumentSemanticTokens(resultId: string | undefined): void {
			}
		});

		monaco.editor.setTheme("base");

		monaco.languages.registerCompletionItemProvider("surreal", {
			triggerCharacters: [" "],
			provideCompletionItems: (model, position) => {

				const textUntilPosition = model.getValueInRange({
					startLineNumber: position.lineNumber,
					startColumn: 1,
					endLineNumber: position.lineNumber,
					endColumn: position.column
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
							endColumn: position.column
						}
					})));
				}

				return {
					suggestions: suggestions,
				};
			}
		});

		let documentationInfo = await GetDocs();
		const allCompletions = [];
		if (documentationInfo) {
			for (let [key, value] of Object.entries(documentationInfo.docs)) {
				if (value.name?.endsWith('()')) {
					value.name = value.name.slice(0, -2);
				}
				let insertParams = null;
				if (value.params?.filter(param => param !== "").length > 0) {
					insertParams = value.params.map((param, idx) => `\${${idx + 1}:${param}}`).join(", ")
				}
				allCompletions.push({
					label: value.name,
					kind: monaco.languages.CompletionItemKind.Function,
					insertText: `${value.name}(${insertParams})`,
					insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					detail: value.summary,
					documentation: {
						value: value.documentation,
						isTrusted: true,
						supportHtml: true,
						supportThemeIcons: true,
					}
				});
			}
		}

		monaco.languages.registerCompletionItemProvider("surreal", {
			provideCompletionItems: (model, position, context: languages.CompletionContext, token: CancellationToken) => {
				const range = getWordRangeAtPosition(model, position);
				const recentInput = getLastLineInputContent(model, position);

				const filteredCompletions = allCompletions.filter(item => {
					return item.label.toLowerCase().indexOf(recentInput.toLowerCase()) === 0;
				})

				return {
					suggestions: filteredCompletions.map(item => ({...item, range})),
				};
			},
			resolveCompletionItem(item: languages.CompletionItem, token: CancellationToken): languages.ProviderResult<languages.CompletionItem> {
				return item;
			}
		});


	}

	public setup() {
		this.onRun    = defineEvent<{ content: string }>("editor:run:" + this.currentType);
		this.onChange = defineEvent<{ content: string }>("editor:change:" + this.currentType);
	}

	public get defaultOptions(): editor.IStandaloneEditorConstructionOptions {
		return {
			language: "surreal",
			contextmenu: true,
			scrollBeyondLastLine: false,
			overviewRulerLanes: 0,
			fontFamily: "JetBrains Mono",
			fontLigatures: true,
			fontSize: app.$appConfig.preferences.editorFontSize,
			renderLineHighlight: "none",
			lineDecorationsWidth: 12,
			lineNumbersMinChars: 1,
			padding: {top: 10, bottom: 10},
			glyphMargin: false,
			theme: "base",
			automaticLayout: true,
			quickSuggestions: true,
			"semanticHighlighting.enabled": true,
			minimap: {
				enabled: false
			}
		};
	}

	public init(el: HTMLElement, initialContent: string = "") {
		const editorOptions = this.defaultOptions;
		if (this.currentType === "create-entry") {
			editorOptions.language = "json";
		}

		if (this.current) {
			this.current.dispose();
		}

		this.current = editor.create(el, editorOptions);

		this.content.value = initialContent;
		this.current.setValue(this.content.value);

		this.monacoEvents.onChange = this.current.getModel().onDidChangeContent((event) => {
			this.content.value = this.current.getValue();

			this.onChange.invoke({content: this.content.value});
		});

//		this.current.getAction("editor.action.inspectTokens").run();

		this.setActions();
	}

	public initForTable(table: string, el: HTMLElement, initialContent: string = "") {
		if (this.currentType === "query") return;

		const schema = {
			$schema : "http://json-schema.org/draft-07/schema#",
			...schemaStore.jsonSchemaResult.tableSchemas[table]
		};

		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest : false,
			validate            : true,
			schemas             : [
				//@ts-ignore
				{
					fileMatch : ["*"],
					schema    : schema,
				}
			]
		});

		this.init(el, initialContent);
	}

	private setActions() {
		if (this.currentType === "query") {
			this.current.addAction({
				id          : "run",
				label       : "Run",
				keybindings : [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
				run         : () => this.onRun.invoke({content : this.current.getValue()})
			});
		}

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

	public changeFontSize(size: number): void {
		if (!this.current) return;
		this.current.updateOptions({
			fontSize : size,
		});
	}
}

export const Editor = new EditorManager("query");

export const EditEntryEditor = new EditorManager("update-entry");

export const CreateEntryEditor = new EditorManager("create-entry");

function getWordRangeAtPosition(model, position) {
	const word = model.getWordAtPosition(position);
	if (word) {
		const start = position.column - word.word.length - 1;
		const end = position.column;
		return new monaco.Range(position.lineNumber, start, position.lineNumber, end);
	} else {
		return null;
	}
}


function getLastLineInputContent(model, position) {

	const word = model.getWordAtPosition(position);
	if (!word) return null;

	let start = position.column - Math.max(word.word.length, 10) - 1;
	if (start < 0) start = 0;

	const end = position.column;

	const range = new monaco.Range(position.lineNumber, start, position.lineNumber, end);

	return model.getValueInRange(range);
}
