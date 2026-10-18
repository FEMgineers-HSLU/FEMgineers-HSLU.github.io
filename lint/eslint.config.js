import js from "@eslint/js"
import globals from "globals"

export default [
	{
		ignores: [
			"output/**",
			"docs/**",
			"node_modules/**",
			".cache/**"
		]
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: "warn"
		}
	},
	js.configs.recommended,
	{
		rules: {
			"no-var": "error",
			"prefer-const": "warn",
			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_"
				}
			]
		}
	},
	{
		files: ["input/script/**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser
			}
		},
		rules: {
			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_"
				}
			]
		}
	},
	{
		files: ["build/**/*.js", "lint/**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node
			}
		},
		rules: {
			"no-control-regex": "off",
			"preserve-caught-error": "off"
		}
	}
]
