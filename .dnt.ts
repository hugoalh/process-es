import {
	getMetadataFromConfig,
	invokeDenoNodeJSTransformer
} from "DNT";
const configJSR = await getMetadataFromConfig("jsr.jsonc");
await invokeDenoNodeJSTransformer({
	copyAssets: [
		"LICENSE.md",
		"README.md"
	],
	entrypoints: configJSR.getExports(),
	fixInjectedImports: true,
	generateDeclarationMap: true,
	mappings: {
		"https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts": {
			name: "@hugoalh/is-json",
			version: "^1.0.4"
		}
	},
	metadata: {
		name: configJSR.getName(),
		version: configJSR.getVersion(),
		description: "A module for enhanced process operation.",
		keywords: [
			"process"
		],
		homepage: "https://github.com/hugoalh/process-es#readme",
		bugs: {
			url: "https://github.com/hugoalh/process-es/issues"
		},
		license: "MIT",
		author: "hugoalh",
		repository: {
			type: "git",
			url: "git+https://github.com/hugoalh/process-es.git"
		},
		scripts: {
		},
		engines: {
			node: ">=16.13.0"
		},
		private: false,
		publishConfig: {
			access: "public"
		}
	},
	outputDirectory: "dist/npm",
	outputDirectoryPreEmpty: true
});
