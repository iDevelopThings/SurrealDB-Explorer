
module.exports = {
	content : [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme   : {
		extend : {
			colors : {
				'main' : {
					100 : '#fff',
					200 : '#b1b7cb',
					300 : '#6e7a9b',
					400 : '#3b4a6b',
					600 : '#444a55',
					500 : '#393e46',
					700 : '#222632',
					800 : '#1b1f28',
					900 : '#161a20',
				},
			}
		},
	},
	plugins : [],
};
