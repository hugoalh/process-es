import { getProcessInfo } from "./get.ts";
Deno.test("Main", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getProcessInfo());
});
