# Process (ES)

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh/process-es](https://img.shields.io/github/v/release/hugoalh/process-es?label=hugoalh/process-es&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh/process-es")](https://github.com/hugoalh/process-es)
[![JSR: @hugoalh/process](https://img.shields.io/jsr/v/@hugoalh/process?label=@hugoalh/process&labelColor=F7DF1E&logo=jsr&logoColor=000000&style=flat "JSR: @hugoalh/process")](https://jsr.io/@hugoalh/process)
[![NPM: @hugoalh/process](https://img.shields.io/npm/v/@hugoalh/process?label=@hugoalh/process&labelColor=CB3837&logo=npm&logoColor=ffffff&style=flat "NPM: @hugoalh/process")](https://www.npmjs.com/package/@hugoalh/process)

An ES (JavaScript & TypeScript) module for enhanced process operation.

## 🔰 Begin

### 🎯 Targets

|  | **Remote** | **JSR** | **NPM** |
|:--|:--|:--|:--|
| **[Bun](https://bun.sh/)** >= v1.1.0 | ❌ | ❓ | ✔️ |
| **[Deno](https://deno.land/)** >= v1.42.0 | ✔️ | ✔️ | ✔️ |
| **[NodeJS](https://nodejs.org/)** >= v16.13.0 | ❌ | ❓ | ✔️ |

> [!NOTE]
> - It is possible to use this module in other methods/ways which not listed in here, however those methods/ways are not officially supported, and should beware maybe cause security issues.

### 💽 External Dependencies

- [PowerShell (Core)](https://github.com/PowerShell/PowerShell)

### #️⃣ Resources Identifier

- **Remote - GitHub Raw:**
  ```
  https://raw.githubusercontent.com/hugoalh/process-es/{Tag}/mod.ts
  ```
- **JSR:**
  ```
  [jsr:]@hugoalh/process[@{Tag}]
  ```
- **NPM:**
  ```
  [npm:]@hugoalh/process[@{Tag}]
  ```

> [!NOTE]
> - For usage of remote resources, it is recommended to import the entire module with the main path `mod.ts`, however it is also able to import part of the module with sub path if available, but do not import if:
>
>   - it's path has an underscore prefix (e.g.: `_foo.ts`, `_util/bar.ts`), or
>   - it is a benchmark or test file (e.g.: `foo.bench.ts`, `foo.test.ts`), or
>   - it's symbol has an underscore prefix (e.g.: `_bar`, `_foo`).
>
>   These elements are not considered part of the public API, thus no stability is guaranteed for them.
> - For usage of JSR or NPM resources, it is recommended to import the entire module with the main entrypoint, however it is also able to import part of the module with sub entrypoint if available, please visit the [file `jsr.jsonc`](./jsr.jsonc) property `exports` for available sub entrypoints.
> - It is recommended to use this module with tag for immutability.

### 🛡️ Runtime Permissions

- Subprocesses \[Deno: `run`\]
  - `pwsh` (Optional)
  - *Resources* (Optional)

## 🧩 APIs

- ```ts
  function getProcessInfo(options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
  function getProcessInfo(id: number, options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
  function getProcessInfo(ids: readonly number[], options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
  function getProcessInfo(name: string, options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
  function getProcessInfo(names: readonly string[], options?: ProcessGetInfoOptions): Promise<ProcessInfo[]>;
  ```

> [!NOTE]
> - For the full or prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/documentation_generator/)
>   - [JSR](https://jsr.io/@hugoalh/process)
