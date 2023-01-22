import {SemVer} from "semver";
import {marked} from "marked";
import {compile, h, type VNode} from "vue";

export interface IUpdateInformation {
	body: string;
	version: string;
	url: string;
	publishedAt: string;
}

const markedRenderer = new marked.Renderer();

markedRenderer.link = (href: string | null, title: string | null, text: string) => {
	return `<Link href="${href}">${text}</Link>`;
};

function processGhMarkdown(raw: string) {
	const lines = raw.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.startsWith("- ")) {
			const hash = line.split(":")[0].replace("- ", "").trim();
			const url  = "https://github.com/idevelopthings/SurrealDB-Explorer/commit/" + hash;

			lines[i] = line.replace(hash, `[${hash}](${url})`);
		}
	}

	return lines.join("\n");
}

export class UpdateInformation {
	body: string;

	processingBody: boolean = false;

	bodyComponent: VNode | null = null;

	version: SemVer;
	url: string;
	publishedAt: Date;

	constructor(data: IUpdateInformation) {
		this.body        = data.body;
		this.version     = new SemVer(data.version);
		this.url         = data.url;
		this.publishedAt = new Date(data.publishedAt);
	}

	public async process() {
		if (this.processingBody) {
			return;
		}

		try {
			this.processingBody = true;

			const rawHtml = marked(processGhMarkdown(this.body), {renderer : markedRenderer});

			const compiled = compile(`<div>${rawHtml}</div>`, {hoistStatic : true});

			this.bodyComponent = h("div", {class : "prose prose-invert"}, [
				h(compiled),
			]);
		} catch (error) {
			console.error(error);
		} finally {
			this.processingBody = false;
		}
	}
}
