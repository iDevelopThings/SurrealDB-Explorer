import {languages} from "monaco-editor";

export const languageConfiguration: languages.LanguageConfiguration = {
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
};

export const language: languages.IMonarchLanguage = {
	defaultToken : "",
	tokenPostfix : ".srql",
	ignoreCase   : true,

	brackets : [
		{open : "[", close : "]", token : "delimiter.square"},
		{open : "(", close : ")", token : "delimiter.parenthesis"}
	],

	keywords  : [
		"USE", "LET", "BEGIN", "CANCEL", "COMMIT", "IF", "ELSE", "SELECT", "INSERT", "CREATE",
		"UPDATE", "RELATE", "DELETE", "DEFINE", "REMOVE", "INFO", "FROM", "SET", "FOR", "NS", "DB",
		"TRANSACTION", "THEN", "END", "WHERE", "SPLIT", "AT", "GROUP", "BY", "ORDER", "ASC", "DESC",
		"COLLATE", "NUMERIC", "LIMIT", "START", "FETCH", "TIMEOUT", "PARALLEL", "CONTENT", "RETURN",
		"NONE", "BEFORE", "AFTER", "DIFF", "MERGE", "PATCH", "SCOPE", "TABLE", "AS", "AND", "OR",
		"CONTAINS", "CONTAINSNOT", "CONTAINSALL", "CONTAINSANY", "CONTAINSNONE", "INSIDE", "NOTINSIDE",
		"ALLINSIDE", "ANYINSIDE", "NONEINSIDE", "OUTSIDE", "INTERSECTS", "KV"
	],
	operators : [
		"AND",
		"BETWEEN",
		"IN",
		"LIKE",
		"NOT",
		"OR",
		"IS",
		"NULL",
		"INTERSECT",
		"UNION",
		"INNER",
		"JOIN",
		"LEFT",
		"OUTER",
		"RIGHT",
		"=",
		"<>",
		"<",
		"<=",
		">",
		">=",
		"+",
		"-",
		"*",
		"/",
		"%",
		"!",
		"^",
		"~",
		"|",
		"&",
		"||",
		"&&",
		"->",
		"<-",
		"<->"
	],

	builtinFunctions : [
//		"math", "max"
	],
	builtinVariables : [
		// NOT SUPPORTED
	],
	tokenizer        : {

		root         : [

			[/[a-z][\w$]*::[a-z][\w$]*/, "predefined"],

			[/\$\w+/, "variable"],

			{include : "@comments"},
			{include : "@whitespace"},
			{include : "@numbers"},
			{include : "@strings"},
			{include : "@scopes"},
			[/[;,.]/, "delimiter"],
			[/[()]/, "@brackets"],
			[/\$\w+/, "param"],
			[
				/[\w@]+/,
				{
					cases : {
						"@operators"        : "operator",
						"@builtinVariables" : "predefined",
						"@builtinFunctions" : "predefined",
						"@keywords"         : "keyword",
//						"@default"          : "identifier"
					}
				}
			],
			[/[<>=!%&+\-*/|~^]/, "operator"],
//			[/[a-z][\w\$]*/, "identifier"],

		],
		whitespace   : [[/\s+/, "white"]],
		comments     : [
			[/--+.*/, "comment"],
			[/#+.*/, "comment"],
			[/\/\/+.*/, "comment"],
			[/\/\*/, {token : "comment.quote", next : "@comment"}]
		],
		comment      : [
			[/[^*/]+/, "comment"],
			[/\*\//, {token : "comment.quote", next : "@pop"}],
			[/./, "comment"],
		],
		numbers      : [
			[/0[xX][0-9a-fA-F]*/, "number"],
			[/[$][+-]*\d*(\.\d*)?/, "number"],
			[/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, "number"]
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

		scopes : [
			// NOT SUPPORTED
		]
	}
};
