<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Working Guidelines for DeciTrade

This document defines mandatory operational instructions for AI agents working in this repository.

---

## 1. Interaction & Pair-Programming Guidelines

- **Guide Rather Than Auto-Write**: Unless the user explicitly asks to modify/generate files directly, explain **what to do**, **where to do it (file path)**, and **what code to write**.
- **Show Targeted Changes**: When updating existing components, provide focused diffs or line-by-line snippets instead of re-dumping massive files.
- **Preserve Nomenclature & Copy**: Never rename, adapt, or alter user-provided labels, field names, business roles (e.g. `WHOLESALER`, `RETAILER`), or text copy unless explicitly requested.
- **Incremental & Grounded Learning**:
  - Prioritize native React and Next.js primitives (`useState`, declarative `<Link>`) before reaching for additional hooks (`useRouter`, `useSearchParams`) or third-party libraries (Zod, React Hook Form, i18n).
  - Only introduce advanced abstractions when the user is ready and asks for them.

---

## 2. Living Documentation (`guideline.md`) Rules

Whenever project architecture, routes, or features change, the agent must update `guideline.md` according to these strict rules:

- **Format per File**:
  1. **Location**: Exact relative path (`src/...`).
  2. **What it does**: Purpose and core behavior.
  3. **Key Snippet**: Concise code snippet demonstrating the key pattern (never dump full 100+ line components).
- **Authoritative Tone**: Write the guideline as an accurate reference from step 1. Do not include debugging stories, bug-fix narratives ("we broke this and fixed it"), or unprompted next-step roadmaps.

---

## 3. Project Technical Standards

- **Stack**: Next.js App Router (v16+), React 19, TypeScript (Strict), Tailwind CSS v4, Lucide React.
- **Semantic HTML & Layout**:
  - Only **one** `<main>` landmark per document, placed in `src/app/layout.tsx` with `className="flex flex-1 flex-col"`.
  - Child pages and nested layouts must not duplicate `<main>`.
- **React 19 Event Typing**:
  - `React.FormEvent` is deprecated. Always use `React.SubmitEvent<HTMLFormElement>` for `onSubmit`.
- **Client-Side Form Validation**:
  - Add `noValidate` to `<form>` tags when handling custom validation state to suppress default browser tooltips.
  - Centralize shared regular expressions in `src/lib/validator.ts`.
