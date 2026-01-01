/**
 * @file commitlint.config.js
 * @description Commitlint configuration enforcing conventional commit format.
 * Defines allowed commit types (feat, fix, docs, etc.) and formatting rules
 * for consistent commit messages across the project.
 */

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
    "subject-case": [0], // disabled - allow filenames like CLAUDE.md and acronyms
    "header-max-length": [2, "always", 72],
    "footer-max-line-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
  },
};
