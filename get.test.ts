import {
	getProcessInfo,
	getProcessInfoSync
} from "./get.ts";
Deno.test("Async", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getProcessInfo());
});
Deno.test("Sync", {
	permissions: {
		run: ["pwsh"]
	}
}, () => {
	console.log(getProcessInfoSync());
});
