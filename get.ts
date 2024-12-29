import {
	isJSONArray,
	isJSONObject,
	type JSONValue
} from "https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts";
export interface ProcessInfo {
	/**
	 * Command line that the process used to start; Maybe unobtainable.
	 */
	command: string | null;
	/**
	 * Amount of processor time that the process has used on all processors, in seconds.
	 */
	cpuTime: number;
	/**
	 * Number of handles opened by the process.
	 */
	handlesCount: number;
	/**
	 * ID of the process (i.e.: PID).
	 */
	id: number;
	/**
	 * Amount of non paged system memory of the process, in bytes.
	 */
	memoryNonPagedSystem: bigint;
	/**
	 * Amount of paged memory of the process, in bytes.
	 */
	memoryPaged: bigint;
	/**
	 * Peak amount of paged memory of the process, in bytes.
	 */
	memoryPagedPeak: bigint;
	/**
	 * Amount of paged system memory of the process, in bytes.
	 */
	memoryPagedSystem: bigint;
	/**
	 * Amount of private memory of the process, in bytes.
	 */
	memoryPrivate: bigint;
	/**
	 * Amount of virtual memory of the process, in bytes.
	 */
	memoryVirtual: bigint;
	/**
	 * Peak amount of virtual memory of the process, in bytes.
	 */
	memoryVirtualPeak: bigint;
	/**
	 * Name of the process.
	 */
	name: string;
	/**
	 * Parent process of the process.
	 */
	parent: ProcessInfo | null;
	/**
	 * Path of the executable file of the process; Maybe unobtainable.
	 */
	path: string | null;
	/**
	 * Priority of the process.
	 */
	priority: number;
	/**
	 * Base priority of the process.
	 */
	priorityBase: number;
	/**
	 * The started time of the process.
	 */
	timeStarted: Date;
	/**
	 * Version number of the process; Maybe not defined.
	 */
	version: string | null;
	/**
	 * Size of the working set of the process, in bytes.
	 */
	workingSet: bigint;
	/**
	 * Maximum size of working set of the process, in bytes.
	 */
	workingSetMaximum: bigint;
	/**
	 * Minimum size of working set of the process, in bytes.
	 */
	workingSetMinimum: bigint;
	/**
	 * Peak size of working set of the process, in bytes.
	 */
	workingSetPeak: bigint;
}
export interface ProcessGetInfoOptions {
	/**
	 * Specify the path of the PowerShell executable. By default, this looks for `pwsh` in the environment variable `PATH`.
	 * @default {"pwsh"}
	 */
	powershellPath?: string | URL;
}
function resolvePSProcessCommand(param0?: number | string | readonly number[] | readonly string[] | ProcessGetInfoOptions, param1?: ProcessGetInfoOptions): Deno.Command {
	let filters: readonly (number | string)[];
	let options: ProcessGetInfoOptions | undefined;
	if (Array.isArray(param0)) {
		filters = param0;
		options = param1 ?? {};
	} else if (
		typeof param0 === "number" ||
		typeof param0 === "string"
	) {
		filters = [param0];
		options = param1 ?? {};
	} else {
		filters = [];
		options = param0 as ProcessGetInfoOptions | undefined ?? {};
	}
	const { powershellPath = "pwsh" }: ProcessGetInfoOptions = options;
	const commandGPS: string[] = ["Get-Process"];
	if (filters.length > 0) {
		if (filters.every((filter: number | string): filter is number => {
			return (typeof filter === "number" && Number.isSafeInteger(filter) && filter >= 0);
		})) {
			commandGPS.push("-Id", `@(${filters.join(", ")})`);
		} else if (filters.every((filter: number | string): filter is string => {
			return (typeof filter === "string");
		})) {
			commandGPS.push("-Name", `@('${filters.join("', '")}')`);
		} else {
			throw new TypeError(`Parameter \`filters\` is not type of numbers or strings!`);
		}
	}
	const args: string[] = ["-NoLogo", "-NonInteractive", "-NoProfile", "-NoProfileLoadTime"];
	if (Deno.build.os === "windows") {
		args.push("-WindowStyle", "Hidden");
	}
	args.push("-Command", `
#Requires -PSEdition Core
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
Function Convert-ProcessToJson {
	[OutputType([PSCustomObject])]
	Param (
		[Parameter(Mandatory = $True, Position = 0)][System.Diagnostics.Process]$Process
	)
	Return [PSCustomObject]@{
		command = $Process.CommandLine
		cpuTime = $Process.CPU ?? 0
		handlesCount = ($Process.HandleCount ?? 0).ToString()
		id = $Process.Id.ToString()
		memoryNonPagedSystem = ($Process.NonpagedSystemMemorySize64 ?? 0).ToString()
		memoryPaged = ($Process.PagedMemorySize64 ?? 0).ToString()
		memoryPagedPeak = ($Process.PeakPagedMemorySize64 ?? 0).ToString()
		memoryPagedSystem = ($Process.PagedSystemMemorySize64 ?? 0).ToString()
		memoryPrivate = ($Process.PrivateMemorySize64 ?? 0).ToString()
		memoryVirtual = ($Process.VirtualMemorySize64 ?? 0).ToString()
		memoryVirtualPeak = ($Process.PeakVirtualMemorySize64 ?? 0).ToString()
		name = $Process.Name
		parent = ($Null -eq $Process.Parent) ? $Null : (Convert-ProcessToJson -Process $Process.Parent)
		path = $Process.Path
		priority = $Process.PriorityClass
		priorityBase = $Process.BasePriority
		timeStarted = $Process.StartTime
		version = $Process.FileVersion
		workingSet = ($Process.WorkingSet64 ?? 0).ToString()
		workingSetMaximum = ($Process.MaxWorkingSet ?? 0).ToString()
		workingSetMinimum = ($Process.MinWorkingSet ?? 0).ToString()
		workingSetPeak = ($Process.PeakWorkingSet64 ?? 0).ToString()
	}
}
[PSCustomObject[]]$Result = @()
ForEach ($Process In (${commandGPS.join(" ")})) {
	$Result += Convert-ProcessToJson -Process $Process
}
Write-Host -Object (ConvertTo-Json -InputObject $Result -Depth 100 -Compress)
`);
	return new Deno.Command(powershellPath, { args });
}
function mapPSProcessInfo(parameterName: string, entity: JSONValue): ProcessInfo {
	if (!isJSONObject(entity)) {
		throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}\`.`);
	}
	for (const key of Object.keys(entity)) {
		switch (key) {
			case "command":
			case "path":
			case "version":
				if (!(
					typeof entity[key] === "string" ||
					entity[key] === null
				)) {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			case "handlesCount":
			case "id":
			case "memoryNonPagedSystem":
			case "memoryPaged":
			case "memoryPagedPeak":
			case "memoryPagedSystem":
			case "memoryPrivate":
			case "memoryVirtual":
			case "memoryVirtualPeak":
			case "name":
			case "timeStarted":
			case "workingSet":
			case "workingSetMaximum":
			case "workingSetMinimum":
			case "workingSetPeak":
				if (typeof entity[key] !== "string") {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			case "cpuTime":
			case "priority":
			case "priorityBase":
				if (typeof entity[key] !== "number") {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			case "parent":
				// Check with recursive.
				break;
			default:
				throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
		}
	}
	return {
		command: entity.command as string,
		cpuTime: entity.cpuTime as number,
		handlesCount: Number.parseInt(entity.handlesCount as string, 10),
		id: Number.parseInt(entity.id as string, 10),
		memoryNonPagedSystem: BigInt(entity.memoryNonPagedSystem as string),
		memoryPaged: BigInt(entity.memoryPaged as string),
		memoryPagedPeak: BigInt(entity.memoryPagedPeak as string),
		memoryPagedSystem: BigInt(entity.memoryPagedSystem as string),
		memoryPrivate: BigInt(entity.memoryPrivate as string),
		memoryVirtual: BigInt(entity.memoryVirtual as string),
		memoryVirtualPeak: BigInt(entity.memoryVirtualPeak as string),
		name: entity.name as string,
		parent: (entity.parent === null) ? null : mapPSProcessInfo(`${parameterName}.parent`, entity.parent),
		path: entity.path as string,
		priority: entity.priority as number,
		priorityBase: entity.priorityBase as number,
		timeStarted: new Date(entity.timeStarted as string),
		version: entity.version as string | null,
		workingSet: BigInt(entity.workingSet as string),
		workingSetMaximum: BigInt(entity.workingSetMaximum as string),
		workingSetMinimum: BigInt(entity.workingSetMinimum as string),
		workingSetPeak: BigInt(entity.workingSetPeak as string)
	};
}
function resolvePSProcessInfo(commandOutput: Deno.CommandOutput): ProcessInfo[] {
	const {
		code,
		stderr,
		stdout,
		success
	}: Deno.CommandOutput = commandOutput;
	const decoder: TextDecoder = new TextDecoder();
	if (!success) {
		throw new Error(`Unable to get the process info with exit code \`${code}\`: ${decoder.decode(stderr)}`);
	}
	let raw: JSONValue;
	try {
		raw = JSON.parse(decoder.decode(stdout));
	} catch (error) {
		throw new Error(`Unable to get the process info: ${error}`);
	}
	if (!isJSONArray(raw)) {
		throw new Error(`Unable to get the process info: Invalid subprocess output.`);
	}
	return raw.map((entity: JSONValue, index: number): ProcessInfo => {
		return mapPSProcessInfo(`[${index}]`, entity);
	});
}
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessInfo[]>} Info of the processes.
 */
export async function getProcessInfo(options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {number} id ID of the process.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessInfo[]>} Info of the processes.
 */
export async function getProcessInfo(id: number, options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly number[]} ids ID of the processes.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessInfo[]>} Info of the processes.
 */
export async function getProcessInfo(ids: readonly number[], options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {string} name Name of the process; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessInfo[]>} Info of the processes.
 */
export async function getProcessInfo(name: string, options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly string[]} names Name of the processes; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessInfo[]>} Info of the processes.
 */
export async function getProcessInfo(names: readonly string[], options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
export async function getProcessInfo(param0?: number | string | readonly number[] | readonly string[] | ProcessGetInfoOptions, param1?: ProcessGetInfoOptions): Promise<ProcessInfo[]> {
	return resolvePSProcessInfo(await resolvePSProcessCommand(param0, param1).output());
}
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessInfo[]} Info of the processes.
 */
export function getProcessInfoSync(options?: ProcessGetInfoOptions): ProcessInfo[];
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {number} id ID of the process.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessInfo[]} Info of the processes.
 */
export function getProcessInfoSync(id: number, options?: ProcessGetInfoOptions): ProcessInfo[];
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly number[]} ids ID of the processes.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessInfo[]} Info of the processes.
 */
export function getProcessInfoSync(ids: readonly number[], options?: ProcessGetInfoOptions): ProcessInfo[];
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {string} name Name of the process; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessInfo[]} Info of the processes.
 */
export function getProcessInfoSync(name: string, options?: ProcessGetInfoOptions): ProcessInfo[];
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly string[]} names Name of the processes; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessInfo[]} Info of the processes.
 */
export function getProcessInfoSync(names: readonly string[], options?: ProcessGetInfoOptions): ProcessInfo[];
export function getProcessInfoSync(param0?: number | string | readonly number[] | readonly string[] | ProcessGetInfoOptions, param1?: ProcessGetInfoOptions): ProcessInfo[] {
	return resolvePSProcessInfo(resolvePSProcessCommand(param0, param1).outputSync());
}
