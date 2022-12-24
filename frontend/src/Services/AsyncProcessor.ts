import {reactive} from "vue";


export class AsyncHandler<T = any, P = ((...args: any) => any)> {

	private func: P;

	public processing: boolean = false;
	public value: T;
	public error: string;

	constructor(promise: P, public withHandler: boolean = false) {
		this.func = promise;
	}

	public async invoke(...args: any[]): Promise<any> {
		this.processing = true;
		try {
			this.value      = await (this.func as Function)(...args);
			this.processing = false;
		} catch (e) {
			console.error(e);
			this.processing = false;
		}
	}

}

export function Async<T = any, P = ((...args: any[]) => any)>(
	func: P
): AsyncHandler<T, P> {
	return reactive(new AsyncHandler(func)) as AsyncHandler<T, P>;
}

type RemoveFirstNItems<T extends unknown[], N extends number, Removed extends unknown[] = []> =
	Removed["length"] extends N
		? T
		: T extends [infer First, ...infer Rest]
			? RemoveFirstNItems<Rest, N, [...Removed, First]>
			: never;

export interface IHandler<TValue = any> {
	isConfirmed(): boolean;
	askConfirm(message: string): void;
	confirm(): void;
	error(message?: string): void;
}

export class AsyncHandlerFunction<
	Func extends ((...args: any) => any) = ((...args: any) => any),
	Args extends any[] = Parameters<Func>,
	Return = ReturnType<Func>
> {

	private func: Func;

	public processing: boolean = false;

	public value: Return;

	public errorMessage: string = null;

	public isConfirmHandler       = false;
	public confirmTimeout: any    = null;
	public confirmed: boolean     = false;
	public confirmMessage: string = null;

	constructor(promise: Func, confirmed: boolean = false) {
		this.func             = promise;
		this.isConfirmHandler = confirmed;
	}

	public get confirmationMessage() {
		return this.confirmMessage;
	}

	public get isConfirmed() {
		return this.confirmed;
	}

	private async _invoke(...args: Args): Promise<any> {
		this.processing = true;
		try {
			this.value      = await (this.func as Function)(...args);
			this.processing = false;

			console.log('finished: ', this.value);
		} catch (e) {
			console.error(e);
			this.processing = false;
		}
	}


	public async invoke(
		...args: Args
	): Promise<any> {
		const fArgs = [this, ...args] as any

		if (!this.isConfirmHandler) {
			await this._invoke(...fArgs);
			return;
		}

		if (this.confirmTimeout) {
			this.confirm(...fArgs as any);
			return;
		}

		await this._invoke(...fArgs);
	}

	public askConfirm(message: string): void {
		this.confirmMessage = message;
		this.confirmed      = false;

		this.confirmTimeout = setTimeout(() => {
			this.confirmMessage = "";
			this.confirmed      = false;
		}, 3000);
	}

	public confirm(...args: Args) {
		this.confirmed = true;
		clearTimeout(this.confirmTimeout);

		this._invoke(...args);
	}

	public error(message: string) {
		this.errorMessage = message;
		setTimeout(() => this.errorMessage = null, 3000);
	}
}



export function AsyncFunc<
	FArgs extends any[],
	Func = (...args: [IHandler, ...FArgs]) => any,
>(
	func: (...args: [IHandler, ...FArgs]) => any
) {
	return reactive(new AsyncHandlerFunction(func as any)) as
		AsyncHandlerFunction<(...args: FArgs) => any>;
}

export function ConfirmedAsyncFunc<
	FArgs extends any[],
	Func = (...args: [IHandler, ...FArgs]) => any,
>(
	func: (...args: [IHandler, ...FArgs]) => any
) {
	return reactive(new AsyncHandlerFunction(func as any, true)) as AsyncHandlerFunction<(...args: FArgs) => any>;
}
