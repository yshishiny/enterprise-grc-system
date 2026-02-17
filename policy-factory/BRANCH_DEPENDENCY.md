# Framework Tuning - Branch Dependency Resolution

## Current Situation

**Branch:** `feat/framework-tuning-v1`
**Status:** Build failing
**Root Cause:** Missing UI component fixes from `fix/build-green` branch

## What's Been Created ✅

Successfully implemented framework mapping layer:

- ✅ `lib/types.ts` - Control/Policy type definitions (3,572 bytes)
- ✅ `data/frameworks/controls-sample.json` - 5 sample controls with cross-framework mappings (7,145 bytes)
- ✅ `lib/frameworks/loader.ts` - Framework query utilities (3,720 bytes)
- ✅ `lib/generator/policy-builder.ts` - Deterministic policy builder (6,693 bytes)
- ✅ `app/api/generate-policy/route.ts` - Updated API to use mappings

### Sample Controls Created

1. **AC-001** - User Authentication (maps to ISO27001, NIST 800-53, NIST CSF, COBIT, FRA)
2. **RM-001** - Risk Assessment (maps to ISO27001, NIST CSF, COBIT, FRA)
3. **GV-001** - Board Oversight (maps to COBIT, NIST CSF, FRA)
4. **CM-001** - Regulatory Compliance (maps to ISO27001, COBIT, FRA)
5. **DR-001** - Disaster Recovery (maps to ISO27001, NIST 800-53, NIST CSF, COBIT)

## Build Errors

```
Module not found: Can't resolve '@/components/ui/checkbox'
Module not found: Can't resolve '@/components/ui/label'
Module not found: Can't resolve '@/components/ui/textarea'
Module not found: Can't resolve 'radix-ui' (in badge.tsx, button.tsx, tabs.tsx)
```

## Why This Happened

The build fixes in `fix/build-green` branch include:

- New UI components (checkbox, label, textarea, tabs)
- Fixed radix imports (radix-ui → @radix-ui/react-\*)
- Package.json updates

But `feat/framework-tuning-v1` was branched from `main`, which doesn't have these fixes yet.

---

## Resolution Options

### Option 1: Merge Build Fix First (RECOMMENDED ✅)

**Steps:**

1. Merge `fix/build-green` PR to `main` on GitHub
2. Pull updated `main` locally
3. Rebase `feat/framework-tuning-v1` onto updated `main`:
   ```bash
   git checkout feat/framework-tuning-v1
   git rebase main
   ```
4. Continue framework work with clean build

**Pros:**

- Clean history
- Proper PR workflow
- No duplicate fixes

**Cons:**

- Requires GitHub PR merge first

---

### Option 2: Cherry-Pick UI Fixes

**Steps:**

```bash
# While on feat/framework-tuning-v1
git cherry-pick fix/build-green
```

**Pros:**

- Can continue immediately
- No waiting for PR merge

**Cons:**

- Messy history (same commits in two branches)
- Potential conflicts later

---

### Option 3: Stash and Restart

**Steps:**

```bash
# Stash current work
git stash

# Merge fixes to main (or wait for PR)
git checkout main
git merge fix/build-green

# Create new branch
git checkout -b feat/framework-tuning-v1-clean

# Restore work
git stash pop
```

**Pros:**

- Clean branch lineage
- Fresh start

**Cons:**

- More steps
- Risk of stash conflicts

---

## Recommendation

**Go with Option 1:**

1. You merge the build fix PR on GitHub now
2. I'll rebase this branch onto updated main
3. Build will be green and we can continue

This maintains clean history and proper workflow.

---

## Next Steps After Resolution

Once build is green:

1. ✅ Test generator end-to-end with sample controls
2. Add more controls (scale to 20-30 across all categories)
3. Update framework pages to use loader
4. Create control detail component
5. Commit and create PR for framework tuning

---

**Waiting on:** Your preference for resolution option
