<!-- CLAVIX:START -->

# Clavix - Prompt Improvement Assistant

Clavix is installed in this project. Use the following slash commands:

- `/clavix:improve [prompt]` - Optimize prompts with smart depth auto-selection
- `/clavix:prd` - Generate a PRD through guided questions
- `/clavix:start` - Start conversational mode for iterative refinement
- `/clavix:summarize` - Extract optimized prompt from conversation

**When to use:**

- **Standard depth**: Quick cleanup for simple, clear prompts
- **Comprehensive depth**: Thorough analysis for complex requirements
- **PRD mode**: Strategic planning with architecture and business impact

Clavix automatically selects the appropriate depth based on your prompt quality.

For more information, run `clavix --help` in your terminal.

<!-- CLAVIX:END -->

# Project Workflow Rules

You are strictly required to follow these workflow rules for every task.

## 1. Master Plan (todos.md)

- **Initiation**: If `todos.md` does not exist, CREATE IT immediately using `Planner-Sisyphus`.
- **Structure**: The file must contain a comprehensive list of tasks from development start to finish.
- **Status**: Use `[ ]` for pending and `[x]` for completed tasks.
- **Update**: You MUST mark tasks as `[x]` immediately after completion.

## 2. Change Tracking (CHANGELOG.md)

- **Initiation**: If `CHANGELOG.md` does not exist, create it.
- **Format**: Use Keep A Changelog format (Unreleased, Added, Changed, Fixed).
- **Update**: Every time you complete a meaningful task or modify code behavior, append a bullet point to the `Unreleased` section.

## 3. Version Control (Git)

- **Commit**: You must commit changes after every logical unit of work (e.g., after completing a single item in `todos.md`).
- **Message**: Commit messages must be descriptive (e.g., `feat: implement login page UI`, `fix: resolve jwt token error`).
- **History**: Ensure the git history tells a clear story of the development process.

## 4. Execution Protocol

- BEFORE starting coding: Check `todos.md`.
- AFTER coding:
  1. Run tests/verification.
  2. Update `CHANGELOG.md`.
  3. Mark item in `todos.md` as `[x]`.
  4. Git add & commit.
