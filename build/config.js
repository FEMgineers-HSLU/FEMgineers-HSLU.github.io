import path from "path"


export const ROOT = process.cwd()


export const isBuild = process.argv.includes("--build")
export const isWatch = process.argv.includes("--watch")
export const isSilent = process.argv.includes("--silent")
export const isDev = !isBuild


export const inputDir = path.join(ROOT, "input")
export const outputDir = path.join(ROOT, "output")


export const styleDir = path.join(outputDir, "style")
export const scriptDir = path.join(outputDir, "script")


export const MANIFEST_FILE = "___manifest.json"


export const tailwindInput = path.join(
	inputDir,
	"style",
	"tailwind.css"
)


export const scriptEntry = path.join(
	inputDir,
	"script",
	"main.js"
)
