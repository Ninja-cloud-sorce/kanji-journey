# Supabase -> Firestore Migration Runbook

## 1. Preconditions
- Freeze Supabase schema changes during migration window.
- Backup Supabase data (logical dump/export).
- Create Firestore database in production mode and apply security rules.
- Ensure service credentials are ready.

## 2. Environment
Set these variables before running:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (escaped with `\n` in shell/env file)

Install migration runtime dependency:

```bash
npm i firebase-admin --save-dev
```

## 3. Phase Execution
Use dry-run first for every phase.

### Phase A: Content
Writes `lessons`, `curriculum/*/modules/*/lessons/*`, `questions`.

```bash
npm run migrate:firestore -- --dry-run --phase=content
npm run migrate:firestore -- --phase=content
```

### Phase B: Users
Writes `users/*` from `profiles`, `learning_paths`, `level_overrides`.

```bash
npm run migrate:firestore -- --dry-run --phase=users
npm run migrate:firestore -- --phase=users
```

### Phase C: History/Progress
Writes `practice_sessions`, `practice_sessions/*/answers/*`, `progress/*`.

```bash
npm run migrate:firestore -- --dry-run --phase=history
npm run migrate:firestore -- --phase=history
```

### Full Run
```bash
npm run migrate:firestore -- --dry-run --phase=all
npm run migrate:firestore -- --phase=all
```

## 4. Idempotency
- Script uses deterministic document IDs and `merge: true`.
- Re-running the same phase updates in place and does not duplicate docs.

## 5. Verification Checklist
- Compare source and target counts:
  - `profiles` vs `users`
  - `lesson_catalog` vs `lessons`
  - `practice_questions` vs `questions`
  - `quiz_attempts` vs total `practice_sessions/*/answers/*`
- Spot-check 10 random users:
  - `currentLevel`, `streak`, `readinessScore`, `weakTopics`.
- Spot-check roadmap:
  - N5..N1 modules and lesson ordering.
- Spot-check exam generation:
  - section question counts are non-zero.

Automated parity verifier:
```bash
npm run verify:firestore-parity -- --sample=25
npm run verify:firestore-parity -- --sample=50 --strict
```
Outputs JSON report in `scripts/migrations/reports`.

## 6. Rollback
- Keep frontend/backend read path on Supabase behind feature flag until parity is confirmed.
- If parity fails, toggle reads back to Supabase and re-run migration after fixes.

## 7. Artifacts
- Each run writes a report in:
  - `scripts/migrations/reports/migration-<timestamp>.json`
