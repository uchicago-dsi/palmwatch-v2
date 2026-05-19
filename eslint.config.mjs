import tseslint from "typescript-eslint";

/** AGENTS.md import-boundary rules only (not a full TS style pass). */
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "public/data/**",
      "lib/generated/**",
      "scripts/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app/**"],
              message: "Features must not import from the routing layer.",
            },
            {
              group: ["@/features/*/*", "@/features/*/**"],
              message:
                "Import sibling features only via route composition, not deep feature paths.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app/**"],
              message: "Components must not import from the routing layer.",
            },
            {
              group: ["@/features/*", "@/features/**"],
              message:
                "Components must not import features (hoist shared UI or use route composition).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/**/*.{ts,tsx}"],
    ignores: ["lib/client/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/**", "@/app/*", "@/app/**"],
              message: "Pure lib/ must not import features or routes.",
            },
          ],
        },
      ],
    },
  }
);
