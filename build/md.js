import MarkdownIt from "markdown-it"

import { abbr } from "@mdit/plugin-abbr"
import { alert } from "@mdit/plugin-alert"
import { attrs } from "@mdit/plugin-attrs"
import { container } from "@mdit/plugin-container"
import { field } from "@mdit/plugin-field"
import { footnote } from "@mdit/plugin-footnote"
import { ins } from "@mdit/plugin-ins"
import { mark } from "@mdit/plugin-mark"
import { tab } from "@mdit/plugin-tab"
import { tasklist } from "@mdit/plugin-tasklist"
import { fullEmoji as emoji } from "@mdit/plugin-emoji"

import { IMAGE_WIDTHS } from "./image-sizes.js"

import { createRequire } from "module"
const require = createRequire(import.meta.url)

const bracketedSpans = require("markdown-it-bracketed-spans")
const collapsible = require("markdown-it-collapsible")
const linkAttributes = require("markdown-it-link-attributes")

function isOptimizableImage(src) {
	return /\.(jpg|jpeg|png)$/i.test(src)
}

function imageExt(src) {
	const i = src.lastIndexOf(".")
	return i === -1 ? "" : src.slice(i + 1).toLowerCase()
}

function escapeAttr(value = "") {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
}

function escapeClass(value = "") {
	return String(value)
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
}

function renderAttrs(token) {
	if (!token.attrs) return ""

	return token.attrs
		.map(([key, value]) => {
			const escaped = key === "class"
				? escapeClass(value)
				: escapeAttr(value)

			return `${key}="${escaped}"`
		})
		.join(" ")
}

function parseAttrs(str) {
	const attrs = {}
	const regex = /([\w-]+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+)/g
	let match

	while ((match = regex.exec(str))) {
		const key = match[1].toLowerCase()
		let val = match[2]

		if (val.startsWith('"') || val.startsWith("'")) {
			val = val.slice(1, -1)
		}

		attrs[key] = val
	}

	return attrs
}

function hasBlockContent(token) {
	if (!token || !token.children) return false

	return token.children.some(t =>
		t.type === "html_block" ||
		t.tag === "div" ||
		t.tag === "section"
	)
}

function isInsideCustomContainer(env) {
	return env.objectDepth > 0 || env.htmlDepth > 0
}

function omitsParagraphWrapper(env) {
	return isInsideCustomContainer(env) || env.formFieldDepth > 0
}

export function createMarkdown() {
	const md = new MarkdownIt({
		html: true,
		linkify: true,
		typographer: true,
		breaks: false,
		quotes: "«»‹›"
	})

	md.linkify.set({ fuzzyLink: true })

	md
		.use(abbr)
		.use(alert)
		.use(attrs)
		.use(field, {
			allowedAttributes: [
				{ attr: "type" },
				{ attr: "required", boolean: true },
				{ attr: "placeholder" },
				{ attr: "autocomplete" },
				{ attr: "value" },
				{ attr: "rows" }
			],

			fieldsOpenRenderer(tokens, idx) {
				const token = tokens[idx]
				const info = token.info || ""

				const infoId =
					info.match(/(?:^|\s)#([A-Za-z][\w:-]*)/)?.[1] || null

				const infoNameMatch =
					info.match(/(?:^|\s)name=(?:"([^"]+)"|'([^']+)'|([^\s]+))/)

				const infoName = infoNameMatch
					? infoNameMatch[1] || infoNameMatch[2] || infoNameMatch[3]
					: null

				const id =
					token.attrGet?.("id") ||
					infoId ||
					null

				const explicitName =
					token.attrGet?.("name") ||
					infoName ||
					null

				const netlifyMatch =
					info.match(
						/(?:^|\s)netlify=(?:"([^"]+)"|'([^']+)'|([^\s]+))/
					)

				const infoNetlify = netlifyMatch
					? netlifyMatch[1] ||
						netlifyMatch[2] ||
						netlifyMatch[3]
					: null

				const netlifyAttr =
					token.attrGet?.("netlify") ??
					infoNetlify

				const netlify = netlifyAttr !== "false"
				const name = explicitName || id || "form"

				const attrs = [
					`name="${escapeAttr(name)}"`,
					`method="POST"`
				]

				if (id) {
					attrs.push(`id="${escapeAttr(id)}"`)
				}

				if (netlify) {
					attrs.push("netlify")
				}

				return `<form ${attrs.join(" ")}>\n`
			
			},

			fieldsCloseRenderer() {
				return `</form>\n`
			},

			fieldOpenRenderer(meta, _tokens, _idx, _options, env) {
				const name = meta.name || ""

				const attrs = Object.fromEntries(
					(meta.attributes || []).map(({ attr, value }) => [
						String(attr).toLowerCase(),
						value
					])
				)

				const type = String(attrs.type || "text").toLowerCase()

				const required =
					attrs.required === true ||
					attrs.required === "" ||
					attrs.required === "true"

				const safeName = escapeAttr(name)

				env.formFieldDepth = (env.formFieldDepth || 0) + 1
				env.formFieldStack ||= []

				env.formFieldStack.push({
					type,
					name: safeName,
					required,
					placeholder: attrs.placeholder,
					autocomplete: attrs.autocomplete,
					value: attrs.value,
					rows: attrs.rows
				})

				if (type === "submit") {
					return `<p><button type="submit">`
				}

				if (type === "button") {
					return `<p><button type="button">`
				}

				if (type === "hidden") {
					return ""
				}

				return `<p><label><span>`
			},

			fieldCloseRenderer(tokens, idx, options, env) {
				const field = env.formFieldStack?.pop()

				env.formFieldDepth = Math.max(
					(env.formFieldDepth || 1) - 1,
					0
				)

				if (!field) return ""

				const {
					type,
					name,
					required,
					placeholder,
					autocomplete,
					value,
					rows
				} = field

				if (type === "submit" || type === "button") {
					return `</button></p>\n`
				}

				const common = [
					`name="${name}"`,
					`id="${name}"`,
					required ? "required" : "",
					placeholder
						? `placeholder="${escapeAttr(placeholder)}"`
						: "",
					autocomplete
						? `autocomplete="${escapeAttr(autocomplete)}"`
						: ""
				]
					.filter(Boolean)
					.join(" ")

				if (type === "hidden") {
					const valueAttr = value
						? ` value="${escapeAttr(value)}"`
						: ""

					return `<input type="hidden" ${common}${valueAttr}>\n`
				}

				if (type === "textarea") {
					const rowsAttr = rows
						? ` rows="${escapeAttr(rows)}"`
						: ""

					return `</span><textarea ${common}${rowsAttr}></textarea></label></p>\n`
				}

				if (type === "checkbox") {
					const valueAttr = value
						? ` value="${escapeAttr(value)}"`
						: ""

					return `</span><input type="checkbox" ${common}${valueAttr}></label></p>\n`
				}

				if (type === "radio") {
					const valueAttr = value
						? ` value="${escapeAttr(value)}"`
						: ""

					return `</span><input type="radio" ${common}${valueAttr}></label></p>\n`
				}

				const allowedTypes = new Set([
					"text",
					"email",
					"tel",
					"url",
					"number",
					"date",
					"time",
					"password",
					"search"
				])

				const inputType = allowedTypes.has(type)
					? type
					: "text"

				const valueAttr = value
					? ` value="${escapeAttr(value)}"`
					: ""

				return `</span><input type="${inputType}" ${common}${valueAttr}></label></p>\n`
			}
		})
		.use(footnote)
		.use(ins)
		.use(mark)
		.use(tab)
		.use(tasklist)
		.use(emoji)
		.use(bracketedSpans)
		.use(collapsible)
		.use(linkAttributes, {
			matcher: href => /^https?:\/\//.test(href),
			attrs: {
				target: "_blank",
				rel: "noopener noreferrer"
			}
		})

	md.core.ruler.before("linkify", "figure", state => {
		const tokens = state.tokens

		for (let i = 1; i < tokens.length - 1; i++) {
			const inline = tokens[i]

			if (inline.type !== "inline" || !inline.children) continue

			const ch = inline.children

			if (ch.length !== 1 && ch.length !== 3) continue

			let img

			if (ch.length === 1 && ch[0].type === "image") {
				img = ch[0]
			} else if (
				ch.length === 3 &&
				ch[0].type === "link_open" &&
				ch[1].type === "image" &&
				ch[2].type === "link_close"
			) {
				img = ch[1]
			} else {
				continue
			}

			if (
				tokens[i - 1].type !== "paragraph_open" ||
				tokens[i + 1].type !== "paragraph_close"
			) continue

			tokens[i - 1].type = "figure_open"
			tokens[i - 1].tag = "figure"
			tokens[i + 1].type = "figure_close"
			tokens[i + 1].tag = "figure"

			img.attrPush(["tabindex", "0"])

			const titleIdx = img.attrs?.findIndex(([k]) => k === "title") ?? -1

			if (titleIdx !== -1 && img.attrs[titleIdx][1]) {
				const title = img.attrs[titleIdx][1]

				img.attrs.splice(titleIdx, 1)

				const captionChildren =
					state.md.parseInline(title, state.env)[0]?.children || []

				ch.push(new state.Token("figcaption_open", "figcaption", 1))
				ch.push(...captionChildren)
				ch.push(new state.Token("figcaption_close", "figcaption", -1))
			}
		}
	})

	md.block.ruler.before(
		"paragraph",
		"youtube_directive",
		(state, startLine, endLine, silent) => {
			const pos = state.bMarks[startLine] + state.tShift[startLine]
			const max = state.eMarks[startLine]
			const line = state.src.slice(pos, max)

			const match = line.match(
				/^\s*@\s*youtube\b\s*(\{\s*[^}]*?\s*\})?\s*$/i
			)

			if (!match) return false
			if (silent) return true

			const raw = (match[1] || "")
				.slice(1, -1)
				.trim()
				.replace(/\s+/g, " ")

			const attrs = parseAttrs(raw)

			if (!attrs.id) return false

			const token = state.push("youtube_block", "", 0)

			token.block = true
			token.map = [startLine, startLine + 1]
			token.meta = attrs

			state.line = startLine + 1

			return true
		}
	)

	md.renderer.rules.youtube_block = (tokens, idx) => {
		const { id, caption } = tokens[idx].meta || {}

		const rawId = id || ""
		const cleanId = rawId.includes("http")
			? new URL(rawId).searchParams.get("v") || rawId.split("/").pop()
			: rawId

		if (!cleanId) return ""

		const safeId = encodeURIComponent(cleanId)
		const cap = caption
			? md.utils.escapeHtml(caption.trim())
			: ""

		return `<div class="youtube"><iframe title="YouTube video" src="https://www.youtube-nocookie.com/embed/${safeId}" referrerpolicy="origin" allowfullscreen></iframe>${cap ? `<div class="caption">${cap}</div>` : ""}</div>`
	}

	const defaults = {
		paragraphOpen:
			md.renderer.rules.paragraph_open ??
			((tokens, idx, options, env, self) =>
				self.renderToken(tokens, idx, options)),
		paragraphClose:
			md.renderer.rules.paragraph_close ??
			((tokens, idx, options, env, self) =>
				self.renderToken(tokens, idx, options))
	}

	md.use(container, {
		name: "text",
		marker: ":",
		validate(params) {
			return params.trim().match(/^(\w+)/)?.[1] === "text"
		},
		openRenderer(tokens, idx, _opts, env) {
			env.textDepth = (env.textDepth || 0) + 1
			return `<div ${renderAttrs(tokens[idx])}>`
		},
		closeRenderer(_t, _i, _o, env) {
			env.textDepth--
			return "</div>"
		}
	})

	md.use(container, {
		name: "html",
		marker: "!",
		validate(params) {
			return params.trim().match(/^(\w+)/)?.[1] === "html"
		},
		openRenderer(tokens, idx, _opts, env) {
			env.htmlDepth = (env.htmlDepth || 0) + 1
			tokens[idx].attrJoin("class", "not-prose")
			return `<div ${renderAttrs(tokens[idx])}>`
		},
		closeRenderer(_t, _i, _o, env) {
			env.htmlDepth--
			return "</div>"
		}
	})

	md.use(container, {
		name: "object",
		marker: ":",
		validate(params) {
			return params.trim().match(/^(\w+)/)?.[1] === "object"
		},
		openRenderer(tokens, idx, _opts, env) {
			env.objectDepth = (env.objectDepth || 0) + 1
			return `<div ${renderAttrs(tokens[idx])}>`
		},
		closeRenderer(_t, _i, _o, env) {
			env.objectDepth--
			return "</div>"
		}
	})

	md.renderer.rules.paragraph_open = (tokens, idx, options, env, self) => {
		const inline = tokens[idx + 1]

		if (omitsParagraphWrapper(env)) return ""

		if (hasBlockContent(inline)) return ""

		return defaults.paragraphOpen(tokens, idx, options, env, self)
	}

	md.renderer.rules.paragraph_close = (tokens, idx, options, env, self) => {
		const inline = tokens[idx - 1]

		if (omitsParagraphWrapper(env)) return ""

		if (hasBlockContent(inline)) return ""

		return defaults.paragraphClose(tokens, idx, options, env, self)
	}

	md.renderer.rules.softbreak = (tokens, idx, options, env, self) =>
		isInsideCustomContainer(env)
			? ""
			: self.renderToken(tokens, idx, options)

	md.renderer.rules.hardbreak = (tokens, idx, options, env, self) =>
		isInsideCustomContainer(env)
			? ""
			: self.renderToken(tokens, idx, options)

	md.renderer.rules.image = (tokens, idx) => {
		const token = tokens[idx]
		const src = token.attrGet("src")
		const alt = escapeAttr(token.content || "")
		const title = escapeAttr(token.attrGet("title") || "")
		const classAttr = escapeClass(token.attrGet("class") || "")

		if (
			!src ||
			src.startsWith("http") ||
			!isOptimizableImage(src)
		) {
			const classes = ["img", classAttr]
				.filter(Boolean)
				.join(" ")

			return `<img src="${escapeAttr(src)}" alt="${alt}" class="${classes}">`
		}

		const cleanSrc = src.replace(/^\/+/, "")
		const ext = imageExt(cleanSrc)
		const withoutExt = cleanSrc.replace(/\.(jpg|jpeg|png)$/i, "")
		const escapedPath = escapeAttr(withoutExt)
		const fallback = ext === "png" ? "png" : "jpg"

		const srcset = IMAGE_WIDTHS
			.map(width => `/${escapedPath}-${width}.webp ${width}w`)
			.join(", ")

		const attrs = [
			`src="/${escapedPath}.${fallback}"`,
			`alt="${alt}"`
		]

		if (title) attrs.push(`title="${title}"`)
		if (classAttr) attrs.push(`class="${classAttr}"`)

		return `<picture>
			<source type="image/webp" srcset="${srcset}">
			<img ${attrs.join(" ")}>
		</picture>`
	}

	md.core.ruler.push("cleanup_paragraphs", state => {
		const tokens = state.tokens

		for (let i = tokens.length - 3; i >= 0; i--) {
			if (
				tokens[i].type === "paragraph_open" &&
				tokens[i + 1]?.type === "inline" &&
				tokens[i + 2]?.type === "paragraph_close"
			) {
				const content = tokens[i + 1].content.trim()

				if (content === ":::" || content === "") {
					tokens.splice(i, 3)
				}
			}
		}
	})

	return md
}
