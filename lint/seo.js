import fs from "node:fs"
import path from "node:path"
import {parse} from "node-html-parser"

const files = []

function walk(dir) {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const full = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			walk(full)
		} else if (entry.name.endsWith(".html")) {
			files.push(full)
		}
	}
}

walk("output")

let warnings = 0

for (const file of files) {
	const html = fs.readFileSync(file, "utf8")
	const root = parse(html)

	const robots = root.querySelector('meta[name="robots"]')
		?.getAttribute("content")
		?.toLowerCase() ?? ""

	if (robots.includes("noindex")) continue

	const checks = [
		'meta[name="description"]',
		'link[rel="canonical"]',
		'meta[property="og:title"]',
		'meta[property="og:description"]',
		'meta[property="og:image"]',
		'meta[property="og:url"]',
		'meta[property="og:type"]',
		'meta[name="twitter:card"]',
		'script[type="application/ld+json"]'
	]

	for (const selector of checks) {
		if (!root.querySelector(selector)) {
			console.log(`\x1b[1m\x1b[33mWARNING\x1b[0m Missing ${selector}: ${file}`)
			warnings++
		}
	}
}

if (warnings > 0) {
	console.log(`\x1b[1m\x1b[33mWARNING: Detected ${warnings} SEO warning(s).\x1b[0m`)
} else {
	console.log("\x1b[1m\x1b[32m✓ No SEO issues detected.\x1b[0m")
}

process.exitCode = 0