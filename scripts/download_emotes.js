import axios     from "axios";
import * as fs   from 'fs';
import * as path from 'path';


const all        = [];
const emoteLimit = 200;

async function run()
{
	const emotesDir           = path.resolve("frontend", "src", "assets", "emotes");
	const compressedEmotesDir = path.resolve("frontend", "src", "assets", "emotes_compressed");
	
	if (fs.existsSync(emotesDir)) {
		fs.rmdirSync(emotesDir, {recursive : true});
		fs.mkdirSync(emotesDir);
	}
	
	if (fs.existsSync(compressedEmotesDir)) {
		fs.rmdirSync(compressedEmotesDir, {recursive : true});
		fs.mkdirSync(compressedEmotesDir);
	}
	
	let page = 0;
	
	let run = true;
	do {
		
		const response = await axios.request({
			method : 'GET',
			url    : 'https://api.betterttv.net/3/emotes/shared/trending',
			params : {offset : page * 100, limit : 100}
		});
		
		const emotes = response.data.map(d => {
			return {
				id        : d.emote.id,
				code      : d.emote.code,
				imageType : d.emote.imageType,
				animated  : d.emote.animated,
				url       : `https://cdn.betterttv.net/emote/${d.emote.id}/3x.${d.emote.imageType}`
			};
		}).filter(f => f.imageType !== 'gif');
		
		all.push(...emotes);
		
		page++;
		
		console.log(`[${all.length}/${emoteLimit}]`);
		
		if (all.length > emoteLimit) {
			run = false;
		}
		
	} while (run === true);
	
	fs.writeFileSync(path.resolve(emotesDir, '..', 'emotes.json'), JSON.stringify(all, null, 4));
	
	for (let allElement of all) {
		const response = await axios.request({
			method       : 'GET',
			url          : allElement.url,
			responseType : 'stream'
		});
		
		const writer = fs.createWriteStream(path.resolve(emotesDir, `${allElement.id}.${allElement.imageType}`));
		
		response.data.pipe(writer);
		
		await new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
		
		console.log(`[${all.indexOf(allElement) + 1}/${all.length}] ${allElement.id} - ${allElement.code} - ${allElement.url}`);
	}
}

run().then(() => console.log('done'));
