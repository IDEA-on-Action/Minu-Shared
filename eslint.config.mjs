import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    // jsx-a11y 접근성 규칙 (Phase 1: warn 레벨)
    {
        files: ["**/*.{jsx,tsx}"],
        plugins: {
            "jsx-a11y": jsxA11y,
        },
        rules: {
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/aria-props": "warn",
            "jsx-a11y/aria-role": "warn",
            "jsx-a11y/role-has-required-aria-props": "warn",
            "jsx-a11y/click-events-have-key-events": "warn",
            "jsx-a11y/no-static-element-interactions": "warn",
        },
    },
    {
        ignores: ["**/dist/", "**/node_modules/"],
    }
);
