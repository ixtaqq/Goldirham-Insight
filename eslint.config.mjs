import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["tests/**/*.cjs", "tools/next-eslint-glob/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
