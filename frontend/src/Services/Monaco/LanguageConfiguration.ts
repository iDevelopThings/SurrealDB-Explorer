import {languages, editor, type CancellationToken} from "monaco-editor";
import {Theme} from "@/Services/Theme";

export const languageTheme = {
	base    : "vs-dark",
	inherit : true,
	rules   : [
		{token : "string", foreground : Theme.get("emerald.400")},
		{token : "keyword", foreground : Theme.get("violet.300")},
		{token : "param", foreground : Theme.get("blue.200")},
		{token : "comment", foreground : Theme.get("main.300"), fontStyle : "italic"},
		{token : "operator", foreground : Theme.get("surreal")},
		{token : "connector", foreground : Theme.get("gray.300"), fontStyle : "bold"},
		{token : "cast", foreground : Theme.get("yellow.400"), fontStyle : "bold"},
		{token : "predefined", foreground : Theme.get("blue.400")},
		{token : "function", foreground : Theme.get("yellow.400")},
	],
	colors  : {
		"editor.background"                 : Theme.get("main.900"),
		"editorLineNumber.foreground"       : Theme.get("main.500"),
		"editorLineNumber.activeForeground" : Theme.get("main.500")
	}
} satisfies editor.IStandaloneThemeData;

export const legend = {
	tokenTypes     : [
		"comment",
		"string",
		"keyword",
		"number",
		"regexp",
		"operator",
		"type",
		"typeParameter",
		"function",
		"member",
		"variable",
		"parameter",
		"property",
		"label",
	],
	tokenModifiers : [
		"declaration",
	],
} satisfies languages.SemanticTokensLegend;

function getType(type): number {
	return legend.tokenTypes.indexOf(type);
}

function getModifier(modifiers: string[] | string | null): number {
	if (typeof modifiers === "string") {
		modifiers = [modifiers];
	}
	if (Array.isArray(modifiers)) {
		let nModifiers = 0;
		for (let modifier of modifiers) {
			const nModifier = legend.tokenModifiers.indexOf(modifier);
			if (nModifier > -1) {
				nModifiers |= (1 << nModifier) >>> 0;
			}
		}
		return nModifiers;
	} else {
		return 0;
	}
}

const tokenPattern = new RegExp("([a-zA-Z]+)((?:\\.[a-zA-Z]+)*)", "g");

export function provideDocumentSemanticTokens(model: editor.ITextModel, lastResultId: string | null, token: CancellationToken): languages.ProviderResult<languages.SemanticTokens | languages.SemanticTokensEdits> {
	const lines = model.getLinesContent();

	/** @type {number[]} */
	const data = [];

	let prevLine = 0;
	let prevChar = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		for (let match = null; (match = tokenPattern.exec(line));) {
			// translate token and modifiers to number representations
			let type = getType(match[1]);
			if (type === -1) {
				continue;
			}
			let modifier = match[2].length
				? getModifier(match[2].split(".").slice(1))
				: 0;

			data.push(
				// translate line to deltaLine
				i - prevLine,
				// for the same line, translate start to deltaStart
				prevLine === i ? match.index - prevChar : match.index,
				match[0].length,
				type,
				modifier
			);

			prevLine = i;
			prevChar = match.index;
		}
	}
	return {
		data     : new Uint32Array(data),
		resultId : null,
	};
}

export const languageConfiguration = {
	comments         : {
		lineComment  : "//",
		blockComment : ["/*", "*/"]
	},
	brackets         : [
		["{", "}"],
		["[", "]"],
		["(", ")"]
	],
	autoClosingPairs : [
		{open : "{", close : "}"},
		{open : "[", close : "]"},
		{open : "(", close : ")"},
		{open : "\"", close : "\""},
		{open : "'", close : "'"}
	],
	surroundingPairs : [
		{open : "{", close : "}"},
		{open : "[", close : "]"},
		{open : "(", close : ")"},
		{open : "\"", close : "\""},
		{open : "'", close : "'"}
	]
} satisfies languages.LanguageConfiguration;


export const language = {
	defaultToken : "",
	tokenPostfix : ".srql",
	ignoreCase   : true,

	comments : {
		lineComment  : "//",
		blockComment : ["/*", "*/"],
	},

	brackets         : [
		{open : "{", close : "}", token : "delimiter.curly"},
		{open : "[", close : "]", token : "delimiter.square"},
		{open : "(", close : ")", token : "delimiter.parenthesis"}
	],
	autoClosingPairs : [
		{open : "{", close : "}"},
		{open : "[", close : "]"},
		{open : "(", close : ")"},
		{open : "'", close : "'", notIn : ["string", "comment"]},
		{open : "\"", close : "\"", notIn : ["string"]},
		{open : "`", close : "`", notIn : ["string", "comment"]},
		{open : "/**", close : " */", notIn : ["string"]},
	],
	surroundingPairs : [
		{open : "{", close : "}"},
		{open : "[", close : "]"},
		{open : "(", close : ")"},
		{open : "'", close : "'"},
		{open : "\"", close : "\""},
		{open : "`", close : "`"},
	],
	tokenizer        : {
		root         : [

			{include : "@whitespace"},

			[/\$\w+/, "variable"],

			[/[<](bool|int|float|string|number|decimal|datetime|duration|future)[>]/, "cast"],

			[/\b(?:AFTER|ASC|AS|ASSERT|BEFORE|BEGIN( TRANSACTION)?|CANCEL( TRANSACTION)?|COLUMNS|COMMIT( TRANSACTION)?|CONTENT|CREATE|DATABASE|DB|DEFINE|DELETE|DESC|DESCRIBE|DIFF|DROP|ELSE|END|ES256|ES384|ES512|EVENT|FETCH|FIELD|FOR|FROM|FUNCTION|GROUP( BY)?|HS256|HS384|HS512|IF|INDEX|INFO|INSERT(( IGNORE)? INTO)?|INTO|KILL|LET|LIMIT( BY)?|LIVE|LOGIN|MERGE|NAMESPACE|NS|ON DUPLICATE KEY UPDATE|ON|ORDER( BY)?|PASSHASH|PASSWORD|PERMISSIONS|PS256|PS384|PS512|RELATE|REMOVE|REPLACE|RETURN|RS256|RS384|RS512|SCHEMAFULL|SCHEMALESS|SCOPE|SELECT|SESSION|SET|SIGNIN|SIGNUP|SPLIT( ON)?|START( AT)?|TABLE|THEN|TIMEOUT|TOKEN|TYPE|UNIQUE|UPDATE|USE|VALUE|VALUES|VERSION|WHEN|WHERE|true|false|TRUE|FALSE)\b/, "keyword"],
			[/==|!=|\*=|\?=|=|!~|\*~|\?~|~|<=|<|>=|>|\+|-|\*|×|∙|\/|÷|∋|∌|∈|∉|⊇|⊃|⊅|⊆|⊂|⊄|&&|\|\||\b(?:AND|OR|IS NOT|IS|CONTAINSALL|CONTAINSANY|CONTAINSNONE|CONTAINSSOME|CONTAINSNOT|CONTAINS|ALLINSIDE|ANYINSIDE|NONEINSIDE|SOMEINSIDE|NOTINSIDE|INSIDE|OUTSIDE|INTERSECTS)\b/i, "operator"],
			[/[.]|<->|<-|->/, "connector"],

			[/[()]/, "@brackets"],

			{include : "@strings"},
			{include : "@numbers"},
			{include : "@function"},
			[/[a-z][\w\$]*/, "identifier"],

		],
		strings      : [
			[/'/, {token : "string", next : "@string"}],
			[/"/, {token : "string.double", next : "@stringDouble"}]
		],
		string       : [
			[/[^']+/, "string"],
			[/''/, "string"],
			[/'/, {token : "string", next : "@pop"}]
		],
		stringDouble : [
			[/[^"]+/, "string.double"],
			[/""/, "string.double"],
			[/"/, {token : "string.double", next : "@pop"}]
		],

		numbers : [
			[/0[xX][0-9a-fA-F]*/, "number"],
			[/[$][+-]*\d*(\.\d*)?/, "number"],
			[/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, "number"]
		],

		comment : [
			[/[^\/*]+/, "comment"],
			[/\/\*/, "comment", "@push"],
			["\\*/", "comment", "@pop"],
			[/[\/*]/, "comment"]
		],

		whitespace : [
			[/[ \t\r\n]+/, "white"],
			[/\/\*/, "comment", "@comment"],
			[/\/\/.*$/, "comment"],
		],

		function : [
			// Functions calls are defined something like:
			// array::do::thing(...)
			[/\b(\w+::)+\w+(?=\()/, "function"],
			[/\b(\w+::)+\w+(?=\s)/, "function"],
			[/count(?=\()/, "function"],
		],


	}
} satisfies languages.IMonarchLanguage;
