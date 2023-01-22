import emotes from "./../../assets/emotes.json";

export type EmoteType = {
	id: string,
	code: string,
	imageType: string,
	animated: boolean,
	url: string,
}

let loadedEmoteFileNames: string[];

export function getEmotesInfo() {
	return emotes as EmoteType[];
}

export function getAllEmotes(): string[] {
	if (loadedEmoteFileNames) {
		return loadedEmoteFileNames;
	}

	const assets = import.meta.glob("./../../assets/emotes/*", {eager : true}) as Record<string, { default: string }>;

	return loadedEmoteFileNames = Object.values(assets).map(e => e.default);
}


export function getRandomEmotes(amount: number): string[] {
	const emotes                 = getAllEmotes();
	const randomEmotes: string[] = [];

	while (randomEmotes.length < amount) {
		const randomIndex = Math.floor(Math.random() * emotes.length);
		const randomEmote = emotes[randomIndex];

		if (randomEmotes.includes(randomEmote)) {
			continue;
		}

		randomEmotes.push(randomEmote);
	}


	return randomEmotes;
}
