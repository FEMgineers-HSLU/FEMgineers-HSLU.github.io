import fs from "node:fs"

const input = fs.readFileSync(0, "utf8")
const data = JSON.parse(input)
const links = Array.isArray(data.links) ? data.links : []
const broken = links.filter((link) => link.state !== "OK")

for (const link of broken) {
	console.log(
		`\x1b[1m\x1b[31m[${link.status}]\x1b[0m ${link.url} auf ${link.parent}`
	)
}

if (broken.length > 0) {
	console.log(`\x1b[1m\x1b[31mERROR: Detected ${broken.length} broken link(s).\x1b[0m`)
	process.exitCode = 1
} else {
	console.log('\x1b[1m\x1b[32mOK: No broken links detected.\x1b[0m')
	process.exitCode = 0
}
