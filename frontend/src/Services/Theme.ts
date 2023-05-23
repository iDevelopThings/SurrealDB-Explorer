import {type ColorKeys, colors} from "../.generated/Colors";

export class Theme {
	public static colors: { [K in keyof typeof colors]: string };

	static load() {
		Theme.colors = colors;
	}

	static get<K extends keyof typeof colors>(color: K): (typeof colors)[K] {
		if (!Theme.colors) Theme.load();

		return Theme.colors[color];
	}

}
