import path from "path"
import * as parse5 from "parse5"

import { ROOT } from "./config.js"

function warn(...args) {
	console.warn(
		`\n\x1b[1m\x1b[33m${args.join(" ")}\x1b[0m\n`
	)
}

function validateHtml(html, filePath) {
	const errors = []

	parse5.parse(html, {
		sourceCodeLocationInfo: true,
		onParseError(error) {
			errors.push(error)
		}
	})

	if (!errors.length) return

	const first = errors[0]
	const line = first.startLine || 1
	const col = first.startCol || 1

	throw new Error(
		`${path.relative(ROOT, filePath)}:${line}:${col}\n${first.code}`
	)
}

function validateSecurity(html, filePath) {
	if (/<a\s+[^>]*href\s*=\s*['"]javascript:/i.test(html)) {
		throw new Error(
			`${path.relative(ROOT, filePath)}\n` +
				"javascript: links are not allowed"
		)
	}

	const externalBlankLinks = [
		...html.matchAll(
			/<a\s+[^>]*target=['"]_blank['"][^>]*>/gi
		)
	]

	for (const match of externalBlankLinks) {
		const tag = match[0]

		const hasNoopener =
			/rel\s*=\s*['"][^'"]*\bnoopener\b[^'"]*['"]/i
				.test(tag)

		if (!hasNoopener) {
			throw new Error(
				`${path.relative(ROOT, filePath)}\n` +
					'Link with target="_blank" should have rel="noopener"'
			)
		}

		const hrefMatch = tag.match(
			/href=['"]([^'"]+)['"]/i
		)

		const href = hrefMatch?.[1] || ""

		if (href && !href.startsWith("http")) {
			throw new Error(
				`${path.relative(ROOT, filePath)}\n` +
					'Link with target="_blank" should use an external HTTP(S) URL'
			)
		}
	}
}

function validateAccessibility(html, filePath) {
	const images = [
		...html.matchAll(/<img\b[^>]*>/gi)
	]

	for (const match of images) {
		const tag = match[0]

		const hasAlt =
			/alt\s*=\s*['"][^'"]*['"]/i.test(tag)

		if (!hasAlt) {
			warn(
				`${path.relative(ROOT, filePath)}\n` +
					"<img> should have alt text"
			)
		}
	}
}

function validateDuplicateIds(html, filePath) {
	const ids = new Set()

	const matches = [
		...html.matchAll(
			/\sid\s*=\s*['"]([^'"]+)['"]/gi
		)
	]

	for (const match of matches) {
		const id = match[1]

		if (ids.has(id)) {
			throw new Error(
				`${path.relative(ROOT, filePath)}\n` +
					`Duplicate id "${id}"`
			)
		}

		ids.add(id)
	}
}

export function validatePage(html, filePath) {
	validateHtml(html, filePath)
	validateSecurity(html, filePath)
	validateAccessibility(html, filePath)
	validateDuplicateIds(html, filePath)
}