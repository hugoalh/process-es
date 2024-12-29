import {
	getProcessInfo,
	getProcessInfoSync,
	type ProcessGetInfoOptions,
	type ProcessInfo
} from "./get.ts";
export type {
	ProcessGetInfoOptions
};
export async function killProcess(input: number | string, options?: ProcessGetInfoOptions): Promise<void>;
export async function killProcess(inputs: readonly (number | string)[], options?: ProcessGetInfoOptions): Promise<void>;
export async function killProcess(param0: number | string | readonly (number | string)[], options?: ProcessGetInfoOptions): Promise<void> {
	const fails: Error[] = [];
	for (const input of (Array.isArray(param0) ? param0 : [param0])) {
		if (typeof input === "number") {
			try {
				Deno.kill(input);
			} catch (error) {
				fails.push(error as Error);
			}
		} else if (typeof input === "string") {
			let processes: ProcessInfo[] = [];
			try {
				processes = await getProcessInfo(input, options);
			} catch (error) {
				fails.push(error as Error);
			}
			for (const process of processes) {
				try {
					Deno.kill(process.id);
				} catch (error) {
					fails.push(error as Error);
				}
			}
		} else {
			fails.push(new Error(`Invalid process input \`${input}\`!`));
		}
	}
	if (fails.length > 0) {
		throw new AggregateError(fails, `Unable to kill some of the processes!`);
	}
}
export function killProcessSync(input: number | string, options?: ProcessGetInfoOptions): void;
export function killProcessSync(inputs: readonly (number | string)[], options?: ProcessGetInfoOptions): void;
export function killProcessSync(param0: number | string | readonly (number | string)[], options?: ProcessGetInfoOptions): void {
	const fails: Error[] = [];
	for (const input of (Array.isArray(param0) ? param0 : [param0])) {
		if (typeof input === "number") {
			try {
				Deno.kill(input);
			} catch (error) {
				fails.push(error as Error);
			}
		} else if (typeof input === "string") {
			let processes: ProcessInfo[] = [];
			try {
				processes = getProcessInfoSync(input, options);
			} catch (error) {
				fails.push(error as Error);
			}
			for (const process of processes) {
				try {
					Deno.kill(process.id);
				} catch (error) {
					fails.push(error as Error);
				}
			}
		} else {
			fails.push(new Error(`Invalid process input \`${input}\`!`));
		}
	}
	if (fails.length > 0) {
		throw new AggregateError(fails, `Unable to kill some of the processes!`);
	}
}
