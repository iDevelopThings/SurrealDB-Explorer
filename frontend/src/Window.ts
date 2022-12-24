declare global {
	interface Window {
		getZoom(): number;
		zoomIn(): void;
		zoomOut(): void;
		resetZoom(): void;
	}
}

window.getZoom = () => {
	return parseFloat((window.getComputedStyle(document.body) as any).zoom);
};

window.zoomIn = (modifier: number = 0.1) => {
	(document.body.style as any).zoom = (window.getZoom() + modifier).toString();
};

window.zoomOut = (modifier: number = 0.1) => {
	(document.body.style as any).zoom = (window.getZoom() - modifier).toString();
};


window.resetZoom = (modifier: number = 0.1) => {
	(document.body.style as any).zoom = 1;
};

export {};
