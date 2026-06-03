import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config — mirrors the `@/*` path alias from tsconfig.json so unit
 * tests can import the same paths as production code.
 *
 * Kept deliberately minimal; we don't pull in `vite-tsconfig-paths` to
 * avoid the extra dependency surface.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
