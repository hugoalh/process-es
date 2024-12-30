import {
	getProcessInfo,
	getProcessInfoSync,
	type ProcessGetInfoOptions,
	type ProcessInfo
} from "./get.ts";
export type {
	ProcessGetInfoOptions
};
/**
 * Force end of the process, asynchronously.
 * @param {number | string} input ID or name of the process.
 * @param {Omit<ProcessGetInfoOptions, "depth">} [options={}] Options.
 * @returns {Promise<void>}
 */
export async function killProcess(input: number | string, options?: Omit<ProcessGetInfoOptions, "depth">): Promise<void>;
/**
 * Force end of the processes, asynchronously.
 * @param {readonly (number | string)[]} inputs ID or name of the processes.
 * @param {Omit<ProcessGetInfoOptions, "depth">} [options={}] Options.
 * @returns {Promise<void>}
 */
export async function killProcess(inputs: readonly (number | string)[], options?: Omit<ProcessGetInfoOptions, "depth">): Promise<void>;
export async function killProcess(param0: number | string | readonly (number | string)[], options?: Omit<ProcessGetInfoOptions, "depth">): Promise<void> {
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
				processes = (await getProcessInfo(input, {
					...options,
					depth: 0
				})).results;
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
/**
 * Force end of the process, synchronously.
 * @param {number | string} input ID or name of the process.
 * @param {Omit<ProcessGetInfoOptions, "depth">} [options={}] Options.
 * @returns {void}
 */
export function killProcessSync(input: number | string, options?: Omit<ProcessGetInfoOptions, "depth">): void;
/**
 * Force end of the processes, synchronously.
 * @param {readonly (number | string)[]} inputs ID or name of the processes.
 * @param {Omit<ProcessGetInfoOptions, "depth">} [options={}] Options.
 * @returns {void}
 */
export function killProcessSync(inputs: readonly (number | string)[], options?: Omit<ProcessGetInfoOptions, "depth">): void;
export function killProcessSync(param0: number | string | readonly (number | string)[], options?: Omit<ProcessGetInfoOptions, "depth">): void {
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
				processes = getProcessInfoSync(input, {
					...options,
					depth: 0
				}).results;
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
