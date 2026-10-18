import { build } from "esbuild"

import { publish } from "./publish.js"
import {
	isSilent,
	isBuild,
	scriptDir,
	scriptEntry
} from "./config.js"

const options = {
	entryPoints: [scriptEntry],
	outdir: scriptDir,
	bundle: true,
	format: "esm",
	minify: isBuild,
	sourcemap: !isBuild,
	entryNames: "[name].[hash]",
	metafile: true,
	write: false,
	logLevel: "silent"
}

try {
	const result = await build(options)

	const changed = publish(result, scriptDir)

		if (!isSilent) {
			console.log(
				changed
					? "📦 js updated"
					: "📦 js unchanged"
			)
		}
} catch (err) {
	console.error("❌ js:", err.message)
	process.exit(1)
}
