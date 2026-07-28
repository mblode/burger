import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // dist/ is lightningcss and esbuild output built from src/. Formatting it would
  // expand the minified bundles that CDN consumers load.
  ignorePatterns: ["**/*.md", "**/*.mdx", "dist/**", "site/**"],
});
