import fs from "fs"
import path from "path"
import sharp from "sharp"

import {
	ROOT,
	inputDir
} from "./config.js"
import {
	IMAGE_FALLBACK_WIDTH,
	IMAGE_WIDTHS
} from "./image-sizes.js"
import { hashImages } from "./hash.js"

const INPUT = path.join(inputDir, "img")
const CACHE_OUTPUT = path.join(ROOT, ".cache", "img")

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function isOptimizableImage(file) {
	return /\.(jpg|jpeg|png)$/i.test(file)
}

function isPassthroughImage(file) {
	return /\.(svg|gif|ico|webp|avif)$/i.test(file)
}

function isSupportedImage(file) {
	return (
		isOptimizableImage(file) ||
		isPassthroughImage(file)
	)
}

function baseName(file) {
	return file.replace(/\.(jpg|jpeg|png)$/i, "")
}

function needsBuild(srcFile, outFile) {
	if (!fs.existsSync(outFile)) return true

	const srcStat = fs.statSync(srcFile)
	const outStat = fs.statSync(outFile)

	return srcStat.mtime > outStat.mtime
}

async function processImage(filePath, relPath) {
	const ext = path.extname(filePath).toLowerCase()
	const base = baseName(path.basename(relPath))
	const outDir = path.join(
		CACHE_OUTPUT,
		path.dirname(relPath)
	)

	ensureDir(outDir)

	const fallbackExt = ext === ".png"
		? "png"
		: "jpg"

	const jobs = IMAGE_WIDTHS
		.map(width => {
			const outFile = path.join(
				outDir,
				`${base}-${width}.webp`
			)

			if (!needsBuild(filePath, outFile)) {
				return null
			}

			return sharp(filePath)
				.resize({ width })
				.webp({ quality: 82 })
				.toFile(outFile)
		})
		.filter(Boolean)

	const fallbackFile = path.join(
		outDir,
		`${base}.${fallbackExt}`
	)

	const fallbackJob = needsBuild(
		filePath,
		fallbackFile
	)
		? sharp(filePath)
			.resize({
				width: IMAGE_FALLBACK_WIDTH
			})
			.toFormat(
				fallbackExt === "png"
					? "png"
					: "jpeg",
				{ quality: 85 }
			)
			.toFile(fallbackFile)
		: null

	await Promise.all(
		[
			...jobs,
			fallbackJob
		].filter(Boolean)
	)
}

function copyImage(filePath, relPath) {
	const outFile = path.join(
		CACHE_OUTPUT,
		relPath
	)

	if (!needsBuild(filePath, outFile)) {
		return
	}

	ensureDir(path.dirname(outFile))
	fs.copyFileSync(filePath, outFile)
}

async function walk(dir, prefix = "") {
	const entries = fs.readdirSync(
		dir,
		{ withFileTypes: true }
	)

	for (const entry of entries) {
		const fullPath = path.join(
			dir,
			entry.name
		)

		const relPath = path.join(
			prefix,
			entry.name
		)

		if (entry.isDirectory()) {
			await walk(fullPath, relPath)
		} else if (
			isOptimizableImage(entry.name)
		) {
			await processImage(
				fullPath,
				relPath
			)
		} else if (
			isPassthroughImage(entry.name)
		) {
			copyImage(
				fullPath,
				relPath
			)
		}
	}
}

function expectedOutputs(
	dir,
	prefix = "",
	files = new Set()
) {
	if (!fs.existsSync(dir)) return files

	for (
		const entry of fs.readdirSync(
			dir,
			{ withFileTypes: true }
		)
	) {
		const fullPath = path.join(
			dir,
			entry.name
		)

		const relPath = path.join(
			prefix,
			entry.name
		)

		if (entry.isDirectory()) {
			expectedOutputs(
				fullPath,
				relPath,
				files
			)

			continue
		}

		if (!isSupportedImage(entry.name)) {
			continue
		}

		if (isPassthroughImage(entry.name)) {
			files.add(relPath)
			continue
		}

		const dirName = path.dirname(relPath)
		const base = baseName(
			path.basename(relPath)
		)

		const fallback =
			path.extname(entry.name)
				.toLowerCase() === ".png"
				? "png"
				: "jpg"

		for (const width of IMAGE_WIDTHS) {
			files.add(
				path.join(
					dirName,
					`${base}-${width}.webp`
				)
			)
		}

		files.add(
			path.join(
				dirName,
				`${base}.${fallback}`
			)
		)
	}

	return files
}

function removeStaleOutputs(
	dir,
	expected,
	prefix = ""
) {
	if (!fs.existsSync(dir)) return

	for (
		const entry of fs.readdirSync(
			dir,
			{ withFileTypes: true }
		)
	) {
		const fullPath = path.join(
			dir,
			entry.name
		)

		const relPath = path.join(
			prefix,
			entry.name
		)

		if (entry.isDirectory()) {
			removeStaleOutputs(
				fullPath,
				expected,
				relPath
			)

			if (
				fs.readdirSync(fullPath).length === 0
			) {
				fs.rmdirSync(fullPath)
			}

			continue
		}

		if (!expected.has(relPath)) {
			fs.unlinkSync(fullPath)
		}
	}
}

async function run() {
	const expected = expectedOutputs(INPUT)

	removeStaleOutputs(
		CACHE_OUTPUT,
		expected
	)

	if (fs.existsSync(INPUT)) {
		await walk(INPUT)
	}

	hashImages(CACHE_OUTPUT)
}

await run()