import {defineConfig} from 'html-validate'

export default defineConfig({
	extends: ['html-validate:recommended'],

	rules: {
		'attribute-misuse': 'error',
		'element-required-attributes': 'error',
		'no-dup-attr': 'error',
		'no-dup-id': 'error',
		'void-content': 'error',

		'wcag/h37': 'warn',

		'void-style': 'off',
		'area-alt': 'off',
		'attribute-boolean-style': 'off',
		'attribute-empty-style': 'off',
		'doctype-style': 'off',
		'element-permitted-content': 'off',
		'long-title': 'off',
		'no-dup-class': 'off',
		'no-implicit-button-type': 'off',
		'no-implicit-input-type': 'off',
		'no-inline-style': 'off',
		'no-raw-characters': 'off',
		'no-self-closing': 'off',
		'prefer-button': 'off',
		'prefer-native-element': 'off',
		'prefer-tbody': 'off',
		'tel-non-breaking': 'off',
		'text-content': 'off',
		'unique-landmark': 'off',
		'wcag/h30': 'off',
		'wcag/h32': 'off',
		'wcag/h63': 'off'
	}
})
