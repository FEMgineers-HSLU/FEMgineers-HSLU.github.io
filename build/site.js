import fs from "fs"
import path from "path"
import nunjucks from "nunjucks"
import matter from "gray-matter"
import prettier from "prettier"
import { minify } from "html-minifier-terser"

import { createMarkdown } from "./md.js"
import { validatePage } from "./validate.js"
import { transformHtmlPictures } from "./pictures.js"
import {
	getAssets,
	transformHtmlAssets
} from "./assets.js"
import {
	ROOT,
	inputDir,
	isBuild,
	outputDir
} from "./config.js"

const TEMPLATES = path.join(ROOT, "templates")

const isSilent = process.argv.includes("--silent")

function log(...args) {
	if (!isSilent) console.log(...args)
}

const md = createMarkdown()

const env = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(TEMPLATES),
	{ autoescape: true }
)

function stripMarkdownComments(source) {
	const lines = source.split(/\r?\n/)
	const output = []
	let inFence = false
	let fenceMarker = ""

	for (const line of lines) {
		const fenceMatch = line.match(/^\s*(```+|~~~+)/)

		if (fenceMatch) {
			const marker = fenceMatch[1][0]

			if (!inFence) {
				inFence = true
				fenceMarker = marker
			} else if (fenceMarker === marker) {
				inFence = false
				fenceMarker = ""
			}

			output.push(line)
			continue
		}

		if (!inFence && /^\s*\/\//.test(line)) {
			continue
		}

		output.push(line)
	}

	return output.join("\n")
}

function stripHtmlComments(html) {
	return html.replace(/<!--([\s\S]*?)-->/g, (_full, inner) => {
		const content = String(inner || "").trim()
		const match = content.match(/^@public:\s*([\s\S]*)$/i)

		if (!match) return ""

		return `<!--!PUBLIC:${match[1].trim()}-->`
	})
}

function restorePublicHtmlComments(html) {
	return html.replace(
		/<!--\s*!PUBLIC:\s*([\s\S]*?)\s*-->/g,
		(_full, inner) => {
			return `<!-- ${String(inner || "").trim()} -->`
		}
	)
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function isInsideDir(parentDir, childPath) {
	const rel = path.relative(parentDir, childPath)

	return (
		rel !== "" &&
		!rel.startsWith("..") &&
		!path.isAbsolute(rel)
	)
}

function outputPath(mdFile) {
	const rel = path.relative(inputDir, mdFile)
	const dir = path.dirname(rel)
	const base = path.basename(rel, ".md")

	if (dir === "." && base === "index") {
		return path.join(outputDir, "index.html")
	}

	if (base === "index") {
		return path.join(outputDir, dir, "index.html")
	}

	if (dir === ".") {
		return path.join(outputDir, base, "index.html")
	}

	return path.join(
		outputDir,
		dir,
		base,
		"index.html"
	)
}

function removeEmptyOutputDirs(dir) {
	let current = dir

	while (
		current !== outputDir &&
		isInsideDir(outputDir, current) &&
		fs.existsSync(current) &&
		fs.readdirSync(current).length === 0
	) {
		fs.rmdirSync(current)
		current = path.dirname(current)
	}
}

function removeOutputFile(sourceFile) {
	const outFile = sourceFile.endsWith(".md")
		? outputPath(sourceFile)
		: path.join(
			outputDir,
			path.relative(inputDir, sourceFile)
		)

	if (!fs.existsSync(outFile)) return

	fs.unlinkSync(outFile)
	removeEmptyOutputDirs(path.dirname(outFile))

	log("removed:", path.relative(ROOT, outFile))
}

function checkConflict(mdFile) {
	const htmlFile = path.join(
		inputDir,
		path.relative(
			outputDir,
			outputPath(mdFile)
		)
	)

	if (fs.existsSync(htmlFile)) {
		throw new Error(
			`Conflict detected: "${path.relative(inputDir, mdFile)}" and ` +
				`"${path.relative(inputDir, htmlFile)}" produce the same output.`
		)
	}

	const rel = path.relative(inputDir, mdFile)
	const dir = path.dirname(rel)
	const base = path.basename(rel, ".md")

	if (base === "index" && dir !== ".") {
		const sibling = path.join(
			inputDir,
			`${dir}.md`
		)

		if (fs.existsSync(sibling)) {
			throw new Error(
				`Conflict detected: "${dir}.md" and ` +
					`"${dir}/index.md" both exist.`
			)
		}
	} else if (base !== "index") {
		const nestedIndex = path.join(
			inputDir,
			dir,
			base,
			"index.md"
		)

		if (fs.existsSync(nestedIndex)) {
			throw new Error(
				`Conflict detected: "${rel}" and ` +
					`"${path.relative(inputDir, nestedIndex)}" both exist.`
			)
		}
	}
}

function checkHtmlConflict(htmlFile) {
	if (path.basename(htmlFile) !== "index.html") {
		return
	}

	const relDir = path.dirname(
		path.relative(inputDir, htmlFile)
	)

	const candidates = [
		path.join(
			inputDir,
			relDir,
			"index.md"
		)
	]

	if (relDir !== ".") {
		candidates.push(
			path.join(
				inputDir,
				`${relDir}.md`
			)
		)
	}

	const mdFile = candidates.find(
		file => fs.existsSync(file)
	)

	if (mdFile) {
		throw new Error(
			`Conflict detected: "${path.relative(inputDir, mdFile)}" and ` +
				`"${path.relative(inputDir, htmlFile)}" produce the same output.`
		)
	}
}

async function formatHtml(html, buildMode, filePath) {
	const withoutComments = stripHtmlComments(html)

	if (buildMode) {
		const minified = await minify(
			withoutComments,
			{
				collapseWhitespace: true,
				removeComments: true,
				ignoreCustomComments: [/^!PUBLIC:/],
				minifyCSS: true,
				minifyJS: true
			}
		)

		return restorePublicHtmlComments(minified)
	}

	try {
		const formatted = await prettier.format(
			withoutComments,
			{
				parser: "html",
				useTabs: true,
				tabWidth: 1,
				printWidth: 150
			}
		)

		return restorePublicHtmlComments(formatted)
	} catch (e) {
		const message = e.message
			.replace(/\u001b\[[0-9;]*m/g, "")
			.trim()

		throw new Error(
			`${path.relative(ROOT, filePath)}\n${message}`
		)
	}
}

function renderFooter() {
	const footerPath = path.join(
		TEMPLATES,
		"footer.md"
	)

	if (!fs.existsSync(footerPath)) return ""

	const raw = fs.readFileSync(
		footerPath,
		"utf-8"
	)

	const { content } = matter(raw)

	return md.render(
		stripMarkdownComments(content)
	)
}

async function renderMarkdownFile(
	filePath,
	buildMode
) {
	checkConflict(filePath)

	const raw = fs.readFileSync(
		filePath,
		"utf-8"
	)

	const { data, content } = matter(raw)

	if (!data.title) {
		throw new Error(
			`Missing required "title" in ${path.relative(ROOT, filePath)}`
		)
	}

	const htmlContent = md.render(
		stripMarkdownComments(content)
	)

	const footerEnabled = data.footer === true
	const footerHtml = footerEnabled
		? renderFooter()
		: ""

	const rendered = env.render(
		"layout.njk",
		{
			...data,
			shouldIndex: data.shouldIndex === true,
			title: data.title,
			content: htmlContent,
			footerEnabled,
			footerContent: footerHtml,
			assets: getAssets()
		}
	)

	const transformed =
		transformHtmlAssets(rendered)

	validatePage(
		transformed,
		filePath
	)

	const finalHtml = await formatHtml(
		transformed,
		buildMode,
		filePath
	)

	const outFile = outputPath(filePath)

	ensureDir(path.dirname(outFile))
	fs.writeFileSync(outFile, finalHtml)

	log(
		"rendered:",
		path.relative(ROOT, outFile)
	)
}

async function renderHtmlFile(
	filePath,
	buildMode
) {
	checkHtmlConflict(filePath)

	const raw = fs.readFileSync(
		filePath,
		"utf-8"
	)

	let transformed =
		transformHtmlPictures(raw)

	transformed =
		transformHtmlAssets(transformed)

	validatePage(
		transformed,
		filePath
	)

	const finalHtml = await formatHtml(
		transformed,
		buildMode,
		filePath
	)

	const rel = path.relative(
		inputDir,
		filePath
	)

	const outFile = path.join(
		outputDir,
		rel
	)

	ensureDir(path.dirname(outFile))
	fs.writeFileSync(outFile, finalHtml)

	log(
		"rendered:",
		path.relative(ROOT, outFile)
	)
}

async function walk(dir, buildMode) {
	const entries = fs.readdirSync(
		dir,
		{ withFileTypes: true }
	)

	for (const entry of entries) {
		const fullPath = path.join(
			dir,
			entry.name
		)

		if (entry.isDirectory()) {
			await walk(fullPath, buildMode)
		} else if (
			entry.isFile() &&
			entry.name.endsWith(".md")
		) {
			await renderMarkdownFile(
				fullPath,
				buildMode
			)
		} else if (
			entry.isFile() &&
			entry.name.endsWith(".html")
		) {
			await renderHtmlFile(
				fullPath,
				buildMode
			)
		}
	}
}

async function run() {
	if (!fs.existsSync(inputDir)) return

	const changedFiles = process.argv
		.slice(2)
		.filter(arg => !arg.startsWith("--"))

	try {
		if (changedFiles.length === 1) {
			const fullPath =
				path.resolve(changedFiles[0])

			const isInputFile =
				isInsideDir(inputDir, fullPath)

			if (
				isInputFile &&
				!fs.existsSync(fullPath) &&
				(
					fullPath.endsWith(".md") ||
					fullPath.endsWith(".html")
				)
			) {
				removeOutputFile(fullPath)
				await walk(inputDir, isBuild)
				return
			}

			if (
				isInputFile &&
				fullPath.endsWith(".md")
			) {
				await renderMarkdownFile(
					fullPath,
					isBuild
				)

				return
			}

			if (
				isInputFile &&
				fullPath.endsWith(".html")
			) {
				await renderHtmlFile(
					fullPath,
					isBuild
				)

				return
			}
		}

		await walk(inputDir, isBuild)
	} catch (e) {
		console.error(
			`\n\x1b[1m\x1b[31m${e.message}\x1b[0m\n`
		)

		process.exit(1)
	}
}

await run()
process.exit(0)