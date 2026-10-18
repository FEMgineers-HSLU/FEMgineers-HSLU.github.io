import crypto from "crypto"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import {
	MANIFEST_FILE,
	inputDir,
	outputDir
} from "./config.js"

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function toPosix(relPath) {
	return relPath.split(path.sep).join("/")
}

function withHash(fileName, hash) {
	const ext = path.extname(fileName)
	const base = ext ? fileName.slice(0, -ext.length) : fileName
	return ext ? `${base}.${hash}${ext}` : `${base}.${hash}`
}

function fileHash(filePath, hashLength = 8) {
	const data = fs.readFileSync(filePath)

	return crypto
		.createHash("sha256")
		.update(data)
		.digest("hex")
		.slice(0, hashLength)
		.toUpperCase()
}

function listFiles(rootDir, currentDir = rootDir, prefix = "", skipManifest = false) {
	if (!fs.existsSync(currentDir)) return []

	const entries = fs.readdirSync(currentDir, { withFileTypes: true })
	const files = []

	for (const entry of entries) {
		const relPath = path.join(prefix, entry.name)
		const fullPath = path.join(rootDir, relPath)

		if (entry.isDirectory()) {
			files.push(
				...listFiles(
					rootDir,
					fullPath,
					relPath,
					skipManifest
				)
			)

			continue
		}

		if (!entry.isFile()) continue
		if (skipManifest && entry.name === MANIFEST_FILE) continue

		files.push({
			relPath,
			fullPath
		})
	}

	return files
}

function readManifest(manifestPath) {
	if (!fs.existsSync(manifestPath)) return {}

	return JSON.parse(
		fs.readFileSync(manifestPath, "utf8")
	)
}

function removeIfEmpty(dir, stopDir) {
	let current = dir

	while (
		current !== stopDir &&
		current.startsWith(stopDir)
	) {
		if (!fs.existsSync(current)) break
		if (fs.readdirSync(current).length > 0) break

		fs.rmdirSync(current)
		current = path.dirname(current)
	}
}

function removeFileAndEmptyParents(filePath, stopDir) {
	if (!fs.existsSync(filePath)) return

	fs.unlinkSync(filePath)
	removeIfEmpty(path.dirname(filePath), stopDir)
}

function purgeNonManifestFiles(targetDir, allowedFiles) {
	if (!fs.existsSync(targetDir)) return

	const allFiles = listFiles(targetDir)

	for (const file of allFiles) {
		const relPath = toPosix(file.relPath)

		if (relPath === MANIFEST_FILE) continue
		if (allowedFiles.has(relPath)) continue

		removeFileAndEmptyParents(
			file.fullPath,
			targetDir
		)
	}
}

export function syncHashedAssets({
	sourceDir,
	targetDir,
	hashLength = 8,
	excludeRelPaths = []
}) {
	ensureDir(targetDir)

	const manifestPath =
		path.join(targetDir, MANIFEST_FILE)

	const previousManifest =
		readManifest(manifestPath)

	const sourceFiles =
		fs.existsSync(sourceDir)
			? listFiles(
				sourceDir,
				sourceDir,
				"",
				true
			)
			: []

	const excludeSet =
		new Set(excludeRelPaths.map(toPosix))

	const nextEntries = sourceFiles
		.filter(({ relPath }) =>
			!excludeSet.has(toPosix(relPath))
		)
		.map(({ relPath, fullPath }) => {
			const sourceRel = toPosix(relPath)
			const hash = fileHash(
				fullPath,
				hashLength
			)

			const dir = path.dirname(relPath)
			const name = path.basename(relPath)
			const hashedName = withHash(name, hash)

			const hashedRel =
				dir === "."
					? hashedName
					: toPosix(
						path.join(
							dir,
							hashedName
						)
					)

			return {
				sourceRel,
				sourceFullPath: fullPath,
				hashedRel
			}
		})
		.sort((a, b) =>
			a.sourceRel.localeCompare(b.sourceRel)
		)

	const nextManifest = {}
	const allowedFiles =
		new Set([MANIFEST_FILE])

	for (const entry of nextEntries) {
		nextManifest[entry.sourceRel] =
			entry.hashedRel

		allowedFiles.add(entry.hashedRel)

		const previousHashed =
			previousManifest[entry.sourceRel]

		const targetHashedPath =
			path.join(
				targetDir,
				entry.hashedRel
			)

		if (
			previousHashed === entry.hashedRel &&
			fs.existsSync(targetHashedPath)
		) {
			continue
		}

		ensureDir(
			path.dirname(targetHashedPath)
		)

		fs.copyFileSync(
			entry.sourceFullPath,
			targetHashedPath
		)
	}

	for (
		const [sourceRel, hashedRel]
		of Object.entries(previousManifest)
	) {
		if (
			nextManifest[sourceRel] !== hashedRel
		) {
			removeFileAndEmptyParents(
				path.join(
					targetDir,
					hashedRel
				),
				targetDir
			)
		}
	}

	purgeNonManifestFiles(
		targetDir,
		allowedFiles
	)

	fs.writeFileSync(
		manifestPath,
		JSON.stringify(
			nextManifest,
			null,
			"\t"
		)
	)
}

export function hashStatic() {
	syncHashedAssets({
		sourceDir: path.join(
			inputDir,
			"static"
		),
		targetDir: path.join(
			outputDir,
			"static"
		)
	})
}

export function hashImages(
	imageSourceDir = path.join(
		outputDir,
		".cache",
		"img"
	)
) {
	syncHashedAssets({
		sourceDir: imageSourceDir,
		targetDir: path.join(
			outputDir,
			"img"
		)
	})
}

function runCli() {
	const mode = process.argv[2] || "all"

	if (mode === "static") {
		hashStatic()
		return
	}

	if (mode === "img") {
		hashImages()
		return
	}

	hashStatic()
	hashImages()
}

const isMain =
	process.argv[1] &&
	fileURLToPath(import.meta.url) ===
		path.resolve(process.argv[1])

if (isMain) {
	runCli()
}