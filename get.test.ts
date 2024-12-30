import { getProcessInfo } from "./get.ts";
Deno.test("Main", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getProcessInfo());
});
Deno.test("Self", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getProcessInfo(["deno", "pwsh"]));
});
