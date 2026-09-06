// Flat config for ESLint 10.
//
// This repo declared `eslint` and the two @typescript-eslint packages as
// devDependencies but never carried a config or a `lint` script, so ESLint has
// never actually been runnable here - since the move to ESLint 9 it exited with
// "couldn't find an eslint.config file". This is the minimal config that makes
// the declared toolchain work; the rule surface mirrors the two React clients.
//
// CommonJS on purpose: this package has no `"type": "module"`.
const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

// Everything is scoped to the sources; that also keeps this config file itself
// out of the TypeScript rules, which would otherwise reject its `require`s.
const sources = ["**/*.ts"];
const scopeToSources = (configs) => configs.map((config) => ({ ...config, files: sources }));

module.exports = [
  // `../dist` is where `npm run build` copies this package.
  { ignores: ["node_modules", "dist"] },

  ...scopeToSources([
    js.configs.recommended,
    // Supplies the @typescript-eslint plugin, its recommended rules, and the
    // `eslint-recommended` layer that switches off the core rules TypeScript
    // already covers (no-undef, core no-unused-vars, ...).
    ...tseslint.configs["flat/recommended"],
  ]),

  {
    files: sources,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      // The three rules below all report the same thing: the shape of this
      // library's PUBLIC type surface. `geometry` is typed `Function` because it
      // carries stored code that consumers only call `.toString()` on,
      // `custom_variables` is `{}` because it is free-form JSON, and the `any`s
      // are the class-transformer entry points (`fromJS`) and the table-attribute
      // setters. Retyping them is a breaking change for every consumer -
      // mmar-server compiles 69 files against this package by relative path, and
      // both React clients alias it as `@gds` - so it is deliberately NOT part of
      // the ESLint 10 migration. Turning them on is a self-contained follow-up:
      // 8 no-unsafe-function-type, 6 no-empty-object-type and 5 no-explicit-any
      // sites as of this commit.
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // The modeling client already turns this off for the same reason, in its
      // own words: "The gds DTOs [...] force a fair amount of `any`."
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
