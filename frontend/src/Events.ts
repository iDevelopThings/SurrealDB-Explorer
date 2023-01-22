import {defineEvent} from "vue-frontend-utils";

defineEvent<{ message: string }>("something:else");


export const startConfetti = defineEvent<{ maxLoops: number }>("confetti:start");
export const stopConfetti = defineEvent<any>("confetti:stop");
