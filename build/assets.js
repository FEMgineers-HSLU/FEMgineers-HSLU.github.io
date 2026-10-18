import fs from "fs"
import path from "path"

import {
	MANIFEST_FILE,
	outputDir
} from "./config.js"

const manifestCache = new Map()

function readJson(filePath) {
	if (!fs.existsSync(filePath)) return null

	return JSON.parse(
		fs.readFileSync(filePath, "utf-8")
	)
}

function normalizePublicPath(publicPath) {
	return String(publicPath || "")
		.replace(/^\/+/, "")
		.split(path.sep)
		.join("/")
}

function readManifest(dirName) {
	if (manifestCache.has(dirName)) {
		return manifestCache.get(dirName)
	}

	const manifest = readJson(
		path.join(
			outputDir,
			dirName,
			MANIFEST_FILE
		)
	) || {}

	manifestCache.set(dirName, manifest)

	return manifest
}

function resolvePublicAsset(publicPath) {
	if (!publicPath.startsWith("/")) {
		return publicPath
	}

	const cleanPath =
		normalizePublicPath(publicPath)

	const slashIndex = cleanPath.indexOf("/")

	if (slashIndex === -1) return publicPath

	const folder = cleanPath.slice(0, slashIndex)
	const relPath = cleanPath.slice(slashIndex + 1)

	if (!folder || !relPath) return publicPath

	if (
		folder !== "img" &&
		folder !== "static"
	) {
		return publicPath
	}

	const manifest = readManifest(folder)
	const mapped = manifest[relPath]

	if (!mapped) return publicPath

	return `/${folder}/${mapped}`
}

export function getAssets() {
	const assets = {
		tailwind: "/style/tailwind.css",
		main: "",
		style: ""
	}

	const styleManifest = readJson(
		path.join(
			outputDir,
			"style",
			MANIFEST_FILE
		)
	)

	if (styleManifest?.["tailwind.css"]) {
		assets.tailwind =
			`/style/${styleManifest["tailwind.css"]}`
	}

	const scriptManifest = readJson(
		path.join(
			outputDir,
			"script",
			MANIFEST_FILE
		)
	)

	if (scriptManifest?.["main.js"]) {
		assets.main =
			`/script/${scriptManifest["main.js"]}`
	}

	if (scriptManifest?.["main.css"]) {
		assets.style =
			`/script/${scriptManifest["main.css"]}`
	}

	return assets
}

export function transformHtmlAssets(html) {
	const assets = getAssets()

	let transformed = html.replace(
		/(<link\b[^>]*href=)(['"])\/style\/tailwind\.css\2/gi,
		`$1$2${assets.tailwind}$2`
	)

	transformed = transformed.replace(
		/\b(src|href|poster)=(['"])(\/[^'"]+)\2/gi,
		(_full, attr, quote, value) => {
			const nextValue =
				resolvePublicAsset(value)

			return `${attr}=${quote}${nextValue}${quote}`
		}
	)

	transformed = transformed.replace(
		/\bsrcset=(['"])([^'"]+)\1/gi,
		(_full, quote, value) => {
			const rewritten = value
				.split(",")
				.map(part => {
					const token = part.trim()

					if (!token) return token

					const [url, ...rest] =
						token.split(/\s+/)

					const mappedUrl =
						resolvePublicAsset(url)

					return [mappedUrl, ...rest]
						.join(" ")
				})
				.join(", ")

			return `srcset=${quote}${rewritten}${quote}`
		}
	)

	return transformed
}
