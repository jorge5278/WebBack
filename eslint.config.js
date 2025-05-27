import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["src/test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginReact.configs.flat.recommended,
]);
