# Letter Mail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send Sonya's letters to Yarik from inside the game by email while preserving her phone's IndexedDB progress.

**Architecture:** Keep GitHub Pages and the current origin. Post letters to a Formspree form identified by a build-time variable; the form's target address is configured in Formspree. Keep the existing local achievements and quest flow, but run it only after a successful response.

**Tech Stack:** React, TypeScript, Vite, GitHub Pages, Formspree, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-20-letter-mail.md`

## Global Constraints

- Do not change `src/services/db.ts`, `initStore`, the PWA scope, site URL, or any existing progress records.
- Do not place recipient address or credentials in the browser bundle.
- No deployment to `main` until a real form ID and test delivery are available.

## Review Focus

- Blank text: reject before network access.
- Unconfigured form: show an error and retain draft text.
- Rejected or unavailable service: no success count or quest submission.
- Successful acceptance: send only letter text and subject, then count once.
- Existing phone data: no schema or origin change.

---

### Task 1: Mail transport

**Files:** Create `src/services/letters.ts`, `tests/letters.test.mjs`; modify `package.json`.

**Interfaces:** `deliverLetter(text: string, formId: string, fetcher?: typeof fetch): Promise<void>` validates and posts a Formspree request; throws on unavailable service.

- [ ] Write tests for blank text, missing ID, successful response, HTTP failure and network failure.
- [ ] Run tests and confirm expected failures.
- [ ] Implement the minimal transport.
- [ ] Run tests and build.

### Task 2: Integrate mail and remove Telegram setup

**Files:** Modify `src/services/store.ts`, `src/screens/PetDetail.tsx`, `src/screens/parent/ParentSettings.tsx`, `.github/workflows/deploy.yml`, `.env.example`, `README.md`.

**Interfaces:** `sendLetterToYarik` calls `deliverLetter`, then persists `lettersSent` and evaluates achievements. Build receives `VITE_LETTER_FORM_ID` from GitHub Actions variable.

- [ ] Confirm baseline `initStore`/IndexedDB behavior and capture build output.
- [ ] Replace Telegram request and setup UI; preserve stored legacy fields.
- [ ] Run transport tests and production build.
- [ ] Check diff contains no data reset, schema, origin, or PWA changes.
- [ ] Keep the change on a branch until a Formspree ID and real delivery test are available.
