import fs from "fs"
import path from "path"

import {
	MANIFEST_FILE,
	outputDir
} from "./config.js"

const TARGET = path.join(process.cwd(), "docs")

function removeDirContents(dir) {
	if (!fs.existsSync(dir)) return

	for (const entry of fs.readdirSync(dir)) {
		fs.rmSync(
			path.join(dir, entry),
			{
				recursive: true,
				force: true
			}
		)
	}
}

function copyDir(source, target) {
	fs.mkdirSync(target, { recursive: true })

	for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
		if (
			entry.name === ".cache" ||
			entry.name === "_headers" ||
			entry.name === MANIFEST_FILE
		) {
			continue
		}

		const from = path.join(source, entry.name)
		const to = path.join(target, entry.name)

		if (entry.isDirectory()) {
			copyDir(from, to)
			continue
		}

		fs.copyFileSync(from, to)
	}
}

if (!fs.existsSync(outputDir)) {
	throw new Error("output/ not found. Run the main build first.")
}

fs.mkdirSync(TARGET, { recursive: true })
removeDirContents(TARGET)
copyDir(outputDir, TARGET)
fs.writeFileSync(path.join(TARGET, ".nojekyll"), "")

console.log("prepared: docs/")