import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // One HTTP client: store/services/axiosInstance carries the session
      // (in-memory token, refresh on 401, branch switch). A raw axios call or a
      // hand-built Authorization header skips all of that.
      'no-restricted-syntax': ['error',
        {
          selector: "CallExpression[callee.object.name='axios'][callee.property.name=/^(get|post|put|patch|delete|request|create)$/]",
          message: 'Use axiosInstance (or serviceClient) from @store/services/axiosInstance, not axios directly.',
        },
        {
          selector: "Property[key.name='Authorization']",
          message: 'The session layer sets Authorization on every request; do not set it by hand.',
        },
      ],
    },
  },
  {
    // The client itself and its tests.
    files: ['src/store/services/axiosInstance.ts', 'src/utils/authSession.ts', 'src/**/*.test.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
])
