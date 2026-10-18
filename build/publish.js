import fs from "fs"
import path from "path"

import { MANIFEST_FILE } from "./config.js"

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

export function publish(result, outDir) {
	ensureDir(outDir)

	const manifestPath = path.join(outDir, MANIFEST_FILE)

	const manifest = fs.existsSync(manifestPath)
		? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
		: {}

	const outputFiles = new Map(
		result.outputFiles.map(file => [
			path.basename(file.path),
			file
		])
	)

	let changed = false

	for (const output in result.metafile.outputs) {
		const entry = result.metafile.outputs[output]

		if (!entry.entryPoint) {
			continue
		}

		const entryBase = path.basename(
			entry.entryPoint,
			path.extname(entry.entryPoint)
		)

		const files = [
			{
				output,
				key: `${entryBase}${path.extname(output)}`
			}
		]

		if (entry.cssBundle) {
			files.push({
				output: entry.cssBundle,
				key: `${entryBase}.css`
			})
		}

		for (const { output, key } of files) {
			const ext = path.extname(output)
			const fileName = path.basename(output)

			const assetPath = path.join(outDir, fileName)

			const mapFileName = `${fileName}.map`
			const mapPath = path.join(outDir, mapFileName)
			const hasMap = outputFiles.has(mapFileName)

			const outputComplete =
				fs.existsSync(assetPath) &&
				(!hasMap || fs.existsSync(mapPath))

			if (
				manifest[key] === fileName &&
				outputComplete
			) {
				continue
			}

			const pattern = new RegExp(
				`^${entryBase}\\..+${ext.replace(".", "\\.")}(\\.map)?$`
			)

			for (const file of fs.readdirSync(outDir)) {
				if (pattern.test(file)) {
					fs.unlinkSync(path.join(outDir, file))
				}
			}

			const asset = outputFiles.get(fileName)

			if (asset) {
				fs.writeFileSync(
					path.join(outDir, fileName),
					asset.contents
				)
			}

			const map = outputFiles.get(`${fileName}.map`)

			if (map) {
				fs.writeFileSync(
					path.join(outDir, `${fileName}.map`),
					map.contents
				)
			}

			manifest[key] = fileName
			changed = true
		}
	}

	if (changed) {
		fs.writeFileSync(
			manifestPath,
			JSON.stringify(manifest, null, "\t")
		)
	}

	return changed
}