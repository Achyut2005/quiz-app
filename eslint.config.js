const js = require("@eslint/js");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    ignores: [
      "node_modules/**",
      "coverage/**"
    ]
  }
];