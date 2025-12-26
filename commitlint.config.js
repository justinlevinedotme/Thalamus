// commitlint.config.js
// adapted from https://dev.to/amankrsahu/tired-of-confusing-commits-heres-how-to-fix-them-with-commitlint-3lfj
// good format example: feat: add new button component

module.exports = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "docs", // documentation changes
        "style", // code style changes (e.g., formatting)
        "refactor", // code changes that neither fix a bug nor add a feature
        "perf", // performance improvements
        "test", // adding tests
        "chore", // updates to build tools, documentation, etc.
        "ci", // CI related changes
        "build", // changes related to build system or external dependencies
        "revert", // revert a previous commit
        "hotfix", // urgent fixes
        "claude", // AI-assisted changes
      ],
    ],
    "scope-empty": [2, "always"], // no scope allowed
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 72],
    "footer-max-line-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
  },
};
