import type {Container} from "tsparticles-engine";
import {tsParticles} from "tsparticles-engine";
import {loadFull} from "tsparticles";
import particlesOptions from "./options.json";
import {getRandomEmotes} from "./Emotes";
import {useTimeout} from "@/Services/Utils/Timeout";

export type ConfettiInstance = {
	id?: string;
	container?: Container;
}

const instances   = new Map<string, ConfettiInstance>();
let enableLogging = false;
let didInit       = false;

const log = (...args: any[]) => enableLogging ? console.log(...args) : undefined;

async function createParticlesInstance(containerId: string): Promise<ConfettiInstance> {
	const options                                   = particlesOptions;
	options.particles.shape.options.images          = getRandomParticleEmotes(50);
	options.emitters.particles.shape.options.images = getRandomParticleEmotes(100);

	if (!didInit) {
		tsParticles.init();
		await loadFull(tsParticles);
		didInit = true;
	}

	log(`[${containerId}] > Creating instance: `, options);

	const container = await tsParticles.load(containerId, options as any);
	await container.init();

	return {
		id        : containerId,
		container : container
	};
}

export function getRandomParticleEmotes(amount: number) {
	return getRandomEmotes(amount).map(e => ({
		"src"       : e,
		"width"     : 150,
		"height"    : 150,
		"particles" : {
			"size" : {
				"value" : 75 / 2
			}
		}
	}));
}

export type UseParticlesReturn = {
	play(): void;
	stop(ignoreFade?: boolean): void;
	destroy(): void;
	isRunning(): boolean;
}

export type UseParticlesOptions = {
	enableLogging?: boolean;

	fadeIn?: boolean;

	fadeOut?: boolean;

	fadeOutDelay?: number;
}

export async function useParticles(htmlContainer: HTMLElement, options?: UseParticlesOptions): Promise<UseParticlesReturn> {
	const containerId = htmlContainer.id;

	if (options?.enableLogging !== undefined) {
		enableLogging = options.enableLogging;
	}

	let instance = instances.get(containerId);
	let running  = false;

	if (instance) {
		instance.container.destroy();
	}

	instance = await createParticlesInstance(containerId);
	instances.set(containerId, instance);

//	await instance.container.refresh();

	log(`[${containerId}] > Instance: `, instance);

	const removeFadeIn = () => htmlContainer.classList.remove("fade-in-element");
	const addFadeIn    = () => htmlContainer.classList.add("fade-in-element");

	const removeFadeOut = () => htmlContainer.classList.remove("fade-out-element");
	const addFadeOut    = () => htmlContainer.classList.add("fade-out-element");

	const fadeInTimeout = useTimeout(removeFadeOut, 1000);

	const fadeOutTimeout = useTimeout(() => {
		removeFadeIn();
		addFadeOut();
	}, options?.fadeOutDelay ?? 5000);

	async function play() {
		if (options?.fadeIn === true) {
			addFadeIn();
			fadeInTimeout.start();
		}

		instance.container.play(true);
		running = true;

		log(`[${containerId}] > Playing instance: `, instance);

		if (options?.fadeOut === true) {
			fadeOutTimeout.start();
		}
	}

	function stop(ignoreFade?: boolean) {
		instance.container.pause();
		running = false;

		if (options?.fadeOut === true && !ignoreFade) {
			addFadeOut();
		}

		log(`[${containerId}] > Pausing instance: `, instance);
	}

	function destroy() {
		instance.container.destroy();
		instances.delete(containerId);
		running = false;
		fadeInTimeout.stop();
		fadeOutTimeout.stop();
		log(`[${containerId}] > Destroying instance: `, instance);
	}
	return {
		play,
		stop,
		destroy,
		isRunning : () => running
	};
}

