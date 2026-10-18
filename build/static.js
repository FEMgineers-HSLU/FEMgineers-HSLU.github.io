import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import {
	inputDir,
	outputDir
} from "./config.js"
import { syncHashedAssets } from "./hash.js"

const INPUT = path.join(inputDir, "static")
const OUTPUT = path.join(outputDir, "static")

const ROOT_PASSTHROUGH_FILES = [
	"_headers",
	"_redirects",
	"robots.txt",
	"sitemap.xml",
	"site.webmanifest"
]

function copyRootPassthrough() {
	for (const fileName of ROOT_PASSTHROUGH_FILES) {
		const from = path.join(inputDir, fileName)
		const to = path.join(outputDir, fileName)

		if (!fs.existsSync(from)) {
			if (fs.existsSync(to)) {
				fs.unlinkSync(to)
			}
			continue
		}

		fs.copyFileSync(from, to)
	}
}

export async function buildStatic() {
	syncHashedAssets({
		sourceDir: INPUT,
		targetDir: OUTPUT,
		excludeRelPaths: []
	})

	copyRootPassthrough()
}

async function run() {
	await buildStatic()
}

const isMain =
	process.argv[1] &&
	fileURLToPath(import.meta.url) ===
		path.resolve(process.argv[1])

if (isMain) {
	await run()
}
