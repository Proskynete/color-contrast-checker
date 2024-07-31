module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	overrides: [
		{
			extends: ['plugin:astro/recommended', 'prettier'],
			files: ['*.astro'],
			processor: 'astro/client-side-ts',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
			rules: {},
		},
		{
			files: ['*.ts', '*.tsx'],
			extends: [
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended',
				'plugin:react-hooks/recommended',
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:react/recommended',
				'prettier',
			],
			parser: '@typescript-eslint/parser',
			plugins: ['react-refresh', 'simple-import-sort'],
			settings: {
				react: {
					version: 'detect',
				},
			},
			rules: {
				'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
				'simple-import-sort/imports': 'error',
				'simple-import-sort/exports': 'error',
				'react/react-in-jsx-scope': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'react/no-unescaped-entities': 'off',
			},
		},
	],
};
