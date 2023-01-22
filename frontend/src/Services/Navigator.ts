import {router} from "@/Routes";
import {BrowserOpenURL} from "../../wailsjs/runtime";

class NavigatorInstance {
	public static base = window.location;

	public navigate(event: PointerEvent, uri: string) {
		const url = toUrl(uri);

		if (this.isExternalUrl(url)) {
			event.preventDefault();
			if (!this.canOpenInBrowser(url)) {
				console.log("prevented external navigation, not whitelisted: ", url);
				return false;
			}

			BrowserOpenURL(url.toString());

			console.log("opened in browser instead of navigation: ", url);

			return true;
		}

		router.push(url.pathname);

		return true;
	}

	public isWhiteListedHost(url: URL) {
		return [
			"github.com"
		].includes(url.hostname);
	}

	public canOpenInBrowser(url: URL) {
		return this.isWhiteListedHost(url);
	}

	public isExternalUrl(uri: string | URL) {
		return toUrl(uri).hostname !== NavigatorInstance.base.hostname;
	}

}

function toUrl(url: string | URL) {
	if (typeof url === "string") {
		return new URL(url);
	}

	return url;

}

export const AppNavigator = new NavigatorInstance();
