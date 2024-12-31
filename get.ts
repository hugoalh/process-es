import {
	isJSONArray,
	isJSONObject,
	type JSONArray,
	type JSONValue
} from "https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts";
export interface ProcessInfo {
	/**
	 * Command line that the process used to start; Maybe not available due to the platform restriction or require privilege permission.
	 */
	command: string | null;
	/**
	 * Amount of processor time that the process has used on all processors, in seconds; Maybe not available due to the platform restriction or require privilege permission.
	 */
	cpuTime: number;
	/**
	 * Number of handles opened by the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	handlesCount: number;
	/**
	 * ID of the process (i.e.: PID).
	 */
	id: number;
	/**
	 * Amount of non paged system memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryNonPagedSystem: bigint;
	/**
	 * Amount of paged memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryPaged: bigint;
	/**
	 * Peak amount of paged memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryPagedPeak: bigint;
	/**
	 * Amount of paged system memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryPagedSystem: bigint;
	/**
	 * Amount of private memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryPrivate: bigint;
	/**
	 * Amount of virtual memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryVirtual: bigint;
	/**
	 * Peak amount of virtual memory of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	memoryVirtualPeak: bigint;
	/**
	 * Name of the process.
	 */
	name: string;
	/**
	 * ID of the parent process of the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	parentID: number | null;
	/**
	 * Path of the executable file of the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	path: string | null;
	/**
	 * Priority of the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	priority: number | null;
	/**
	 * Base priority of the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	priorityBase: number | null;
	/**
	 * The started time of the process; Maybe not available due to the platform restriction or require privilege permission.
	 */
	timeStarted: Date | null;
	/**
	 * Version number of the process; Maybe not defined, or not available due to the platform restriction or require privilege permission.
	 */
	version: string | null;
	/**
	 * Size of the working set of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	workingSet: bigint;
	/**
	 * Maximum size of working set of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	workingSetMaximum: bigint;
	/**
	 * Minimum size of working set of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	workingSetMinimum: bigint;
	/**
	 * Peak size of working set of the process, in bytes; Maybe not available due to the platform restriction or require privilege permission.
	 */
	workingSetPeak: bigint;
}
export interface ProcessGetInfoOptions {
	/**
	 * Maximum depth of the parent processes should be walked recursively.
	 * @default {Infinity}
	 */
	depth?: number;
	/**
	 * Specify the path of the PowerShell executable. By default, this looks for `pwsh` in the environment variable `PATH`.
	 * @default {"pwsh"}
	 */
	powershellPath?: string | URL;
}
/**
 * Result return from {@linkcode getProcessInfo} or {@linkcode getProcessInfoSync}.
 */
export interface ProcessGetInfoResult {
	/**
	 * Parent processes of the parent processes or result processes. Maybe duplicated in the property {@linkcode results} when the process match the filters.
	 */
	parents: ProcessInfo[];
	/**
	 * Process ID of the PowerShell, which should ended before the result return.
	 */
	powershellID: number;
	/**
	 * Result processes which match the filters.
	 */
	results: ProcessInfo[];
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
	const {
		depth = Infinity,
		powershellPath = "pwsh"
	}: ProcessGetInfoOptions = options;
	if (depth !== Infinity && !(Number.isSafeInteger(depth) && depth >= 0)) {
		throw new RangeError(`Parameter \`options.depth\` is not \`Infinity\`, or a number which is integer, positive, and safe!`);
	}
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
[UInt32]$Depth = ${(depth === Infinity) ? "[UInt32]::MaxValue" : String(depth)}
[PSCustomObject[]]$Parents = @()
[PSCustomObject[]]$Results = @()
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
		parent = $Process.Parent
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
ForEach ($Process In (${commandGPS.join(" ")})) {
	[PSCustomObject]$Result = Convert-ProcessToJson -Process $Process
	$Parent = $Result.Parent
	If ($Null -ne $Parent) {
		$Result.Parent = $Parent.Id.ToString()
	}
	$Results += $Result
	[UInt32]$DepthCurrent = 0
	While ($Null -ne $Parent -and $DepthCurrent -lt $Depth) {
		$DepthCurrent += 1
		$Result = Convert-ProcessToJson -Process $Parent
		$Parent = $Result.Parent
		If ($Null -ne $Parent) {
			$Result.Parent = $Parent.Id.ToString()
		}
		If ($Parents.id -notcontains $Result.id) {
			$Parents += $Result
		}
	}
}
Write-Host -Object (ConvertTo-Json -InputObject ([PSCustomObject]@{
	parents = $Parents
	powershellID = $PID
	results = $Results
}) -Depth 100 -Compress)
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
			case "parent":
			case "path":
			case "timeStarted":
			case "version":
				if (!(
					typeof entity[key] === "string" ||
					entity[key] === null
				)) {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			case "cpuTime":
				if (typeof entity[key] !== "number") {
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
			case "workingSet":
			case "workingSetMaximum":
			case "workingSetMinimum":
			case "workingSetPeak":
				if (typeof entity[key] !== "string") {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			case "priority":
			case "priorityBase":
				if (!(
					typeof entity[key] === "number" ||
					entity[key] === null
				)) {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
				}
				break;
			default:
				throw new Error(`Unable to get the process info: Invalid subprocess output \`${parameterName}.${key}\`.`);
		}
	}
	return {
		command: entity.command as string | null,
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
		parentID: (entity.parent === null) ? null : Number.parseInt(entity.parent as string, 10),
		path: entity.path as string | null,
		priority: entity.priority as number | null,
		priorityBase: entity.priorityBase as number | null,
		timeStarted: (entity.timeStarted === null) ? null : new Date(entity.timeStarted as string),
		version: entity.version as string | null,
		workingSet: BigInt(entity.workingSet as string),
		workingSetMaximum: BigInt(entity.workingSetMaximum as string),
		workingSetMinimum: BigInt(entity.workingSetMinimum as string),
		workingSetPeak: BigInt(entity.workingSetPeak as string)
	};
}
function resolvePSProcessInfo(commandOutput: Deno.CommandOutput): ProcessGetInfoResult {
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
	if (!isJSONObject(raw)) {
		throw new Error(`Unable to get the process info: Invalid subprocess output.`);
	}
	for (const key of Object.keys(raw)) {
		switch (key) {
			case "parents":
			case "results":
				if (!isJSONArray(raw[key])) {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${key}\`.`);
				}
				break;
			case "powershellID":
				if (typeof raw[key] !== "number") {
					throw new Error(`Unable to get the process info: Invalid subprocess output \`${key}\`.`);
				}
				break;
			default:
				throw new Error(`Unable to get the process info: Invalid subprocess output \`${key}\`.`);
		}
	}
	return {
		parents: (raw.parents as JSONArray).map((parent: JSONValue, index: number): ProcessInfo => {
			return mapPSProcessInfo(`parents[${index}]`, parent);
		}),
		powershellID: raw.powershellID as number,
		results: (raw.results as JSONArray).map((result: JSONValue, index: number): ProcessInfo => {
			return mapPSProcessInfo(`results[${index}]`, result);
		})
	};
}
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessGetInfoResult>} Result.
 */
export async function getProcessInfo(options?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {number} id ID of the process.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessGetInfoResult>} Result.
 */
export async function getProcessInfo(id: number, options?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly number[]} ids ID of the processes.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessGetInfoResult>} Result.
 */
export async function getProcessInfo(ids: readonly number[], options?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {string} name Name of the process; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessGetInfoResult>} Result.
 */
export async function getProcessInfo(name: string, options?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult>;
/**
 * Get the info of the processes, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly string[]} names Name of the processes; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {Promise<ProcessGetInfoResult>} Result.
 */
export async function getProcessInfo(names: readonly string[], options?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult>;
export async function getProcessInfo(param0?: number | string | readonly number[] | readonly string[] | ProcessGetInfoOptions, param1?: ProcessGetInfoOptions): Promise<ProcessGetInfoResult> {
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
 * @returns {ProcessGetInfoResult} Result.
 */
export function getProcessInfoSync(options?: ProcessGetInfoOptions): ProcessGetInfoResult;
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {number} id ID of the process.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessGetInfoResult} Result.
 */
export function getProcessInfoSync(id: number, options?: ProcessGetInfoOptions): ProcessGetInfoResult;
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly number[]} ids ID of the processes.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessGetInfoResult} Result.
 */
export function getProcessInfoSync(ids: readonly number[], options?: ProcessGetInfoOptions): ProcessGetInfoResult;
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {string} name Name of the process; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessGetInfoResult} Result.
 */
export function getProcessInfoSync(name: string, options?: ProcessGetInfoOptions): ProcessGetInfoResult;
/**
 * Get the info of the processes, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {readonly string[]} names Name of the processes; Support PowerShell wildcard characters.
 * @param {ProcessGetInfoOptions} [options={}] Options.
 * @returns {ProcessGetInfoResult} Result.
 */
export function getProcessInfoSync(names: readonly string[], options?: ProcessGetInfoOptions): ProcessGetInfoResult;
export function getProcessInfoSync(param0?: number | string | readonly number[] | readonly string[] | ProcessGetInfoOptions, param1?: ProcessGetInfoOptions): ProcessGetInfoResult {
	return resolvePSProcessInfo(resolvePSProcessCommand(param0, param1).outputSync());
}
