import * as parse5 from "parse5"

import { IMAGE_WIDTHS } from "./image-sizes.js"

function isOptimizableImage(src) {
	return /\.(jpg|jpeg|png)$/i.test(src)
}

function imageExt(src) {
	const i = src.lastIndexOf(".")
	return i === -1
		? ""
		: src.slice(i + 1).toLowerCase()
}

function attrsToObject(attrs = []) {
	return Object.fromEntries(
		attrs.map(({ name, value }) => [name, value])
	)
}

function objectToAttrs(obj) {
	return Object.entries(obj)
		.map(([name, value]) => ({ name, value }))
}

function makeTextNode(value) {
	return {
		nodeName: "#text",
		value,
		parentNode: null
	}
}

function makeElement(
	tagName,
	attrs = [],
	childNodes = []
) {
	return {
		nodeName: tagName,
		tagName,
		attrs,
		namespaceURI: "http://www.w3.org/1999/xhtml",
		childNodes,
		parentNode: null
	}
}

function isWhitespaceTextNode(node) {
	return (
		node?.nodeName === "#text" &&
		!node.value.trim()
	)
}

function findOnlyImageChild(node) {
	const meaningfulChildren = (
		node.childNodes || []
	).filter(
		child => !isWhitespaceTextNode(child)
	)

	if (meaningfulChildren.length !== 1) {
		return null
	}

	return meaningfulChildren[0]?.tagName === "img"
		? meaningfulChildren[0]
		: null
}

function buildPictureNode(imgNode, src) {
	const attrs = attrsToObject(imgNode.attrs)
	const cleanSrc = src.replace(/^\/+/, "")
	const ext = imageExt(cleanSrc)
	const withoutExt = cleanSrc.replace(
		/\.(jpg|jpeg|png)$/i,
		""
	)

	const fallback = ext === "png"
		? "png"
		: "jpg"

	const alt = attrs.alt || ""
	const title = attrs.title || ""
	const figcaption = attrs.figcaption || ""
	const classAttr = attrs.class || ""

	const source = makeElement("source", [
		{
			name: "type",
			value: "image/webp"
		},
		{
			name: "srcset",
			value: IMAGE_WIDTHS
				.map(
					width =>
						`/${withoutExt}-${width}.webp ${width}w`
				)
				.join(", ")
		}
	])

	const imgAttrs = [
		{
			name: "src",
			value: `/${withoutExt}.${fallback}`
		},
		{
			name: "alt",
			value: alt
		}
	]

	if (title) {
		imgAttrs.push({
			name: "title",
			value: title
		})
	}

	if (classAttr) {
		imgAttrs.push({
			name: "class",
			value: classAttr
		})
	}

	const img = makeElement("img", imgAttrs)

	const figureChildren = [
		makeElement("picture", [], [source, img])
	]

	if (figcaption) {
		figureChildren.push(
			makeElement(
				"figcaption",
				[],
				[makeTextNode(figcaption)]
			)
		)
	}

	const wrapper = figcaption
		? makeElement(
			"figure",
			[],
			figureChildren
		)
		: makeElement(
			"picture",
			[],
			[source, img]
		)

	const existingParent = imgNode.parentNode || null

	if (existingParent) {
		wrapper.parentNode = existingParent
	}

	source.parentNode = figcaption
		? figureChildren[0]
		: wrapper

	img.parentNode = figcaption
		? figureChildren[0]
		: wrapper

	if (figcaption) {
		figureChildren[0].parentNode = wrapper
		figureChildren[1].parentNode = wrapper
	}

	return wrapper
}

function transformHtmlImages(node) {
	if (!node?.childNodes?.length) return

	const nextChildren = []

	for (const child of node.childNodes) {
		if (child?.tagName === "p") {
			const onlyImage =
				findOnlyImageChild(child)

			if (onlyImage) {
				const src = attrsToObject(
					onlyImage.attrs
				).src || ""

				if (
					src &&
					!src.startsWith("http") &&
					isOptimizableImage(src)
				) {
					nextChildren.push(
						buildPictureNode(
							onlyImage,
							src
						)
					)

					continue
				}
			}
		}

		if (child?.childNodes?.length) {
			transformHtmlImages(child)
		}

		if (child?.tagName === "img") {
			const attrs =
				attrsToObject(child.attrs)

			const src = attrs.src || ""

			if (
				!src ||
				src.startsWith("http") ||
				!isOptimizableImage(src)
			) {
				nextChildren.push(child)
				continue
			}

			nextChildren.push(
				buildPictureNode(child, src)
			)

			continue
		}

		nextChildren.push(child)
	}

	node.childNodes = nextChildren
}

function addTabindexToImages(node) {
	if (!node?.childNodes?.length) return

	for (const child of node.childNodes) {
		if (child?.tagName === "img") {
			const attrs =
				attrsToObject(child.attrs)

			if (!attrs.tabindex) {
				attrs.tabindex = "0"
				child.attrs =
					objectToAttrs(attrs)
			}
		}

		addTabindexToImages(child)
	}
}

export function transformHtmlPictures(html) {
	const document = parse5.parse(html)

	transformHtmlImages(document)
	addTabindexToImages(document)

	return parse5.serialize(document)
}