import {type App} from "vue";

declare global {
	interface Window {
		getZoom(): number;
		zoomIn(): void;
		zoomOut(): void;
		resetZoom(): void;
		app: App<Element>;
	}
}

window.getZoom = () => {
	return parseFloat((window.getComputedStyle(document.body) as any).zoom);
};

window.zoomIn = (modifier: number = 0.1) => {
	window.app.config.globalProperties.$app.onZoomIn();
//	(document.body.style as any).zoom = (window.getZoom() + modifier).toString();
};

window.zoomOut = (modifier: number = 0.1) => {
	window.app.config.globalProperties.$app.onZoomOut();
//	(document.body.style as any).zoom = (window.getZoom() - modifier).toString();
};


window.resetZoom = (modifier: number = 0.1) => {
	window.app.config.globalProperties.$app.onZoomReset();
//	(document.body.style as any).zoom = 1;
};

export {};
