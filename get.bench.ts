import {
	getProcessInfo,
	getProcessInfoSync
} from "./get.ts";
Deno.bench("Async", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	await getProcessInfo();
});
Deno.bench("Sync", {
	permissions: {
		run: ["pwsh"]
	}
}, () => {
	getProcessInfoSync();
});
