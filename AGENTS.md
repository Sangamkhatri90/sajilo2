# AGENTS.md

# ============================================================
# PROJECT WORKING RULES
# ============================================================

This is a large JavaScript/Node.js/Express application.

PRIMARY GOAL:
Solve the requested task with the smallest safe change while
using the minimum necessary context.

Do NOT unnecessarily explore, refactor, rewrite, or explain the
entire application.

# ============================================================
# 1. TOKEN / CONTEXT EFFICIENCY
# ============================================================

IMPORTANT: This is a large codebase. Be conservative with context.

Before reading files:

1. Identify the exact feature/bug being worked on.
2. Identify the most likely relevant file(s).
3. Read those files first.
4. Only inspect additional files when evidence shows they are needed.

DO NOT:
- Scan the entire repository.
- Read every file in a directory.
- Read all JavaScript files under public/js/.
- Read the entire views/ directory.
- Read node_modules/.
- Read generated/build files.
- Read unrelated models/routes/controllers.
- Re-read files that have already been inspected unless necessary.
- Search the whole repository repeatedly for the same thing.

Prefer targeted searches.

Example:

GOOD:
"Find where the Distribution voucher edit button is handled."

BAD:
"Analyze the entire application."

If the relevant code is already identified, work directly on it.

# ============================================================
# 2. TASK EXECUTION
# ============================================================

For every task:

1. Understand the requested behavior.
2. Locate the smallest relevant code area.
3. Inspect only necessary surrounding code.
4. Identify the root cause.
5. Make the smallest working change.
6. Verify the affected functionality.
7. Stop.

Do NOT turn a small bug fix into a refactoring project.

If the task can be solved by changing 5 lines,
do not change 100 lines.

# ============================================================
# 3. EXISTING CODE FIRST
# ============================================================

Always prefer the application's existing architecture.

Before creating something new, check whether an existing:

- function
- route
- controller
- model
- helper
- middleware
- query
- component
- modal
- form
- validation function

can be reused.

DO NOT create duplicate functionality when an existing implementation
can be adapted safely.

Follow existing naming conventions and patterns.

# ============================================================
# 4. MINIMAL DIFF RULE
# ============================================================

Make the smallest practical diff.

Avoid:
- unrelated formatting changes
- renaming variables unnecessarily
- reorganizing files
- changing indentation across entire files
- converting old code to a new architecture
- changing libraries
- changing dependencies
- rewriting working functions
- "cleaning up" unrelated code

If the user asks to fix X, fix X.

Do not automatically fix Y and Z.

# ============================================================
# 5. LARGE FILE RULE
# ============================================================

Some files may be very large.

Especially:

- views/index.ejs
- large files in public/js/
- server.js
- large model files

DO NOT read the entire file unless absolutely necessary.

Locate the relevant function, route, event handler, HTML section,
or JavaScript block first.

Then inspect only the surrounding section.

When modifying a large file:
- preserve unrelated code
- avoid broad rewrites
- avoid changing formatting outside the target area

# ============================================================
# 6. EXPRESS / NODE.JS RULES
# ============================================================

This application uses Node.js and Express.

Respect the existing flow:

request
→ middleware
→ route
→ business logic
→ database/model
→ response

Before changing a route, determine how that route currently works.

Do not introduce a new architecture unless explicitly requested.

Do not convert callbacks to promises/async-await merely for style.

Do not convert CommonJS to ES modules merely for style.

Preserve the project's existing module system.

# ============================================================
# 7. DATABASE SAFETY
# ============================================================

Database changes are HIGH RISK.

Before modifying database-related code:

1. Identify the existing query.
2. Identify the existing database connection/configuration.
3. Follow the existing database access pattern.
4. Change only what is necessary.

DO NOT:
- change database configuration unnecessarily
- change connection settings
- change database names
- change table structures
- delete data
- modify migrations
- rewrite SQL queries unnecessarily

Never assume a database schema.

If schema information is required, inspect only the relevant model/query.

Prefer parameterized queries when modifying SQL.

Do not expose credentials, passwords, connection strings,
API keys, or secrets in responses.

# ============================================================
# 8. FRONTEND JAVASCRIPT
# ============================================================

The application contains many JavaScript files under public/js/.

Do NOT inspect all of them.

For frontend bugs:

1. Find the page/feature.
2. Find the relevant HTML element.
3. Find the event handler/function.
4. Follow only the necessary calls.
5. Modify the smallest relevant section.

Preserve existing:
- event handling
- DOM structure
- IDs
- class names
- API endpoints
- data attributes
- variable conventions

Do not rename IDs/classes unless required.

# ============================================================
# 9. EJS / VIEWS
# ============================================================

When working with EJS:

- Preserve existing HTML structure.
- Preserve existing EJS variables.
- Preserve existing loops and conditions.
- Avoid rewriting the entire template.
- Modify only the relevant section.

If a UI issue is reported:

First determine whether the problem is:

1. HTML/EJS
2. CSS
3. browser JavaScript
4. API/Express route
5. database/backend

Do not change backend code for a frontend-only issue.

Do not change frontend code for a backend-only issue.

# ============================================================
# 10. BUG FIXING
# ============================================================

When fixing a bug, find the ROOT CAUSE.

Do not hide symptoms with unnecessary workarounds.

Preferred process:

1. Reproduce/understand the failure.
2. Trace the relevant execution path.
3. Identify the exact incorrect behavior.
4. Fix the cause.
5. Check for obvious regressions.
6. Stop.

Do not rewrite the feature unless the existing implementation
cannot safely be fixed.

# ============================================================
# 11. SIMILAR FEATURES
# ============================================================

If the requested feature should behave like an existing feature,
USE THE EXISTING FEATURE AS THE REFERENCE.

For example:

"Make Distribution Voucher edit work like Journal Voucher edit."

In that situation:

1. Locate Journal Voucher edit implementation.
2. Understand only the relevant flow.
3. Locate Distribution Voucher edit implementation.
4. Compare the relevant behavior.
5. Apply the necessary difference/fix.
6. Do not redesign either feature.

This is preferred over inventing a new implementation.

# ============================================================
# 12. PRESERVE BUSINESS LOGIC
# ============================================================

This application may contain important accounting/business logic.

Do not modify business rules unless the user explicitly requests it.

Be especially careful with:

- voucher numbers
- transaction numbers
- account numbers
- debit/credit values
- dates
- balances
- totals
- tax calculations
- database transactions
- financial calculations
- permissions
- authentication
- session behavior

Do not "simplify" business logic without understanding it.

# ============================================================
# 13. ERROR HANDLING
# ============================================================

Preserve the application's existing error-handling style.

Do not introduce generic error handling everywhere.

Do not silently swallow errors.

Do not remove useful logging unless requested.

When fixing an error, preserve useful diagnostic information.

# ============================================================
# 14. SECURITY
# ============================================================

Do not expose:

- passwords
- API keys
- database credentials
- session secrets
- tokens
- private keys

Do not disable authentication or authorization to make a feature work.

Do not remove validation simply to make a request succeed.

When modifying SQL, prefer parameterized queries.

# ============================================================
# 15. TESTING / VERIFICATION
# ============================================================

Use targeted verification.

For a frontend change:
- inspect the affected JavaScript/EJS
- check the relevant browser behavior if available

For a backend change:
- check the affected route/function
- run the relevant test or command if available

For a database change:
- verify the query carefully

DO NOT automatically run the entire test suite for a tiny change
unless necessary.

Do not spend large amounts of context explaining test output.

# ============================================================
# 16. TERMINAL COMMANDS
# ============================================================

Prefer focused commands.

GOOD:
- targeted grep/search
- targeted test
- syntax check for changed file
- relevant npm script

AVOID unnecessarily expensive operations such as:
- scanning node_modules
- recursively dumping the entire project
- printing huge files
- running unrelated test suites

Do not use destructive commands unless explicitly requested.

# ============================================================
# 17. WHEN INFORMATION IS MISSING
# ============================================================

Do not guess important behavior.

If the task can be solved safely with the available code,
proceed.

If a critical piece of information is missing, inspect the
smallest relevant source needed to determine it.

Only ask the user when the missing information cannot reasonably
be determined from the project.

# ============================================================
# 18. NO UNNECESSARY PLANNING
# ============================================================

For small tasks, do NOT produce a long plan.

For simple fixes:

inspect → fix → verify → summarize

For complex features, a short plan is acceptable.

Do not spend many tokens describing obvious implementation steps.

# ============================================================
# 19. RESPONSE FORMAT
# ============================================================

After completing a task, keep the final response concise.

Preferred format:

Changed:
- [what changed]
- [what changed]

Verified:
- [test/check performed]

If something could not be verified, say so briefly.

Do not provide a long tutorial unless the user asks for one.

# ============================================================
# 20. IMPORTANT STOP RULE
# ============================================================

Once the requested task is correctly implemented and verified,
STOP.

Do not continue exploring the repository.

Do not suggest unrelated improvements.

Do not refactor unrelated code.

Do not make additional changes "while you're here."

# ============================================================
# DEFAULT BEHAVIOR
# ============================================================

When uncertain between:

A) reading 20 more files
B) making a small targeted investigation

Choose B.

When uncertain between:

A) rewriting existing code
B) minimally modifying existing code

Choose B.

When uncertain between:

A) explaining extensively
B) implementing and briefly summarizing

Choose B.

Priority:

CORRECTNESS > SAFETY > MINIMAL CHANGE > TOKEN EFFICIENCY