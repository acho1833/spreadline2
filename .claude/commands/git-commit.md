---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
description: Commit code with changelog and summary
argument-hint: [optional commit message hint]
---

Create a git commit with a detailed changelog and summary. Follow these steps:

1. **Analyze Changes**: Run `git status` and `git diff` to understand all staged and unstaged changes.

2. **Review Recent History**: Run `git log --oneline -5` to see recent commit message style.

3. **Generate Changelog**: Create a detailed changelog that lists:
   - Files added
   - Files modified
   - Files deleted
   - Key changes in each file (summarize what changed)

4. **Create Commit Summary**: Write a concise commit message that:
   - Has a clear subject line (50 chars or less)
   - Includes a body with the changelog
   - Explains the "why" behind the changes

5. **Stage and Commit**:
   - Stage all relevant changes with `git add`
   - Create the commit with the generated message

User hint for this commit: $ARGUMENTS

Format the commit message like this:
```
<type>: <subject>

## Changelog
- <file1>: <what changed>
- <file2>: <what changed>
...

## Summary
<Brief explanation of why these changes were made>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Where <type> is one of: feat, fix, refactor, docs, style, test, chore
