import fs from "fs"
import path from "path"
import { spawn, spawnSync } from "child_process"
import { build, context } from "esbuild"
import chokidar from "chokidar"

import { publish } from "./publish.js"
import {
	ROOT,
	MANIFEST_FILE,
	isBuild,
	isWatch,
	isSilent,
	styleDir,
	tailwindInput
} from "./config.js"

function tailwindExecutable() {
	return process.platform === "win32"
		? "tailwindcss.cmd"
		: "tailwindcss"
}

const tailwindOutput = path.join(styleDir, "tailwind.css")

const esbuildOptions = {
	entryPoints: {
		tailwind: tailwindOutput
	},
	outdir: styleDir,
	bundle: true,
	minify: isBuild,
	sourcemap: false,
	entryNames: "[name].[hash]",
	metafile: true,
	write: false,
	logLevel: "silent"
}

function runTailwindOnce() {
	const tw = spawnSync(
		tailwindExecutable(),
		[
			"-i",
			tailwindInput,
			"-o",
			tailwindOutput,
			isBuild ? "--minify" : "--no-minify",
			...(isSilent ? ["--silent"] : [])
		],
		{
			cwd: ROOT,
			stdio: "inherit",
			shell: process.platform === "win32"
		}
	)

	if (tw.error) throw tw.error
	if (tw.status !== 0) throw new Error("Tailwind build failed")
}

function runTailwindWatch() {
	let proc
	let stopping = false
	let restartTimeout
	let restartPending = false

	const start = () => {
		if (stopping) return
		restartPending = false

		proc = spawn(
			tailwindExecutable(),
			[
				"-i",
				tailwindInput,
				"-o",
				tailwindOutput,
				"--watch",
				"--no-minify",
				...(isSilent ? ["--silent"] : [])
			],
			{
				cwd: ROOT,
				stdio: "inherit",
				shell: process.platform === "win32"
			}
		)

		proc.on("error", err => {
			console.error("❌ tailwind:", err.message)
		})

		proc.on("exit", (code, signal) => {
			if (stopping) return

			if (restartPending) {
				restartTimeout = setTimeout(start, 100)
				return
			}

			console.error(
				`❌ tailwind exited (${signal ?? `code ${code}`}); waiting for input change`
			)
		})
	}

	start()

	const restart = () => {
		if (stopping) return

		clearTimeout(restartTimeout)
		restartPending = true
		if (proc?.exitCode === null) {
			proc.kill()
		} else {
			restartTimeout = setTimeout(start, 100)
		}
	}

	const stop = () => {
		stopping = true
		clearTimeout(restartTimeout)
		proc?.kill()
	}

	process.once("SIGINT", stop)
	process.once("SIGTERM", stop)

	return { restart, stop }
}

function getCssFileFromManifest() {
	const manifestPath = path.join(styleDir, MANIFEST_FILE)

	if (!fs.existsSync(manifestPath)) return null

	return JSON.parse(
		fs.readFileSync(manifestPath, "utf8")
	)["tailwind.css"]
}

function runSiteBuild() {
	const result = spawnSync(
		process.execPath,
		["build/site.js", "--silent"],
		{
			cwd: ROOT,
			stdio: "inherit"
		}
	)

	if (result.error) {
		throw result.error
	}

	if (result.status !== 0) {
		throw new Error("Site build failed")
	}
}

async function buildOnce() {
	runTailwindOnce()

	const tailwindCss = fs.readFileSync(tailwindOutput)
	const result = await build(esbuildOptions)
	const changed = publish(result, styleDir)

	if (isBuild) {
		fs.unlinkSync(tailwindOutput)
	} else {
		fs.writeFileSync(tailwindOutput, tailwindCss)
	}

	if (!isSilent && changed) {
		console.log("🎨 css updated")
	}
}

async function watchMode() {
	const tailwind = runTailwindWatch()

	const ctx = await context(esbuildOptions)

	let lastCssFile = getCssFileFromManifest()
	let initialized = false
	let timeout = null

	const watcher = chokidar.watch(tailwindOutput, {
		ignoreInitial: true
	})
	const inputWatcher = chokidar.watch(tailwindInput, {
		ignoreInitial: true
	})

	watcher.on("add", handle)
	watcher.on("change", handle)
	inputWatcher.on("add", tailwind.restart)
	inputWatcher.on("change", tailwind.restart)

	async function handle() {
		clearTimeout(timeout)

		timeout = setTimeout(async () => {
			try {
				const result = await ctx.rebuild()
				const changed = publish(result, styleDir)

				const newCssFile = getCssFileFromManifest()

				if (initialized && lastCssFile !== newCssFile) {
					runSiteBuild()
				}

				lastCssFile = newCssFile
				initialized = true

				if (isSilent && changed) {
					console.log(
						"file changed (input/style/tailwind.css) and site updated"
					)
				} else if (!isSilent && changed) {
					console.log("🎨 css updated")
				}
			} catch (err) {
				console.error("❌ css:", err.message)
			}
		}, 50)
	}
}

if (isWatch) {
	watchMode()
} else {
	try {
		await buildOnce()
	} catch (err) {
		console.error("❌ css:", err.message)
		process.exit(1)
	}
}
