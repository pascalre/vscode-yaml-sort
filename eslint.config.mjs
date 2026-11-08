import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import { importX } from "eslint-plugin-import-x"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  {
    ignores: ["coverage/**", "dist/**", "out/**", ".vscode-test/**"],
  },
  {
    files: ["**/*.{js,ts}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["src/test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
  {
    rules: {
      "semi": ["error", "never"],
      "quotes": ["warn", "double"],
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: true,
        },
      ],
      "import-x/no-unresolved": "off",
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["sibling", "parent"], "index", "unknown"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
)
