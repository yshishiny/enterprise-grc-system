# PR Ready - Copy-Paste Content

## 🔗 PR Link

**Open here:** https://github.com/yshishiny/enterprise-grc-system/pull/new/fix/build-green

---

## 📋 PR Title (Copy-Paste)

```
fix(build): normalize shadcn/radix imports, remove broken deps, clean globals.css
```

---

## 📝 PR Description (Copy-Paste)

````markdown
## Summary

This PR restores a clean, reproducible production build by aligning UI imports and dependencies to standard shadcn/Radix conventions and removing invalid/broken dependencies/imports.

## What changed

**Normalized UI imports** away from `radix-ui` to `@radix-ui/react-*` packages:

- Added `@radix-ui/react-scroll-area`
- Fixed imports in multiple UI components

**Removed broken dependency:** `next-intl` (npm could not resolve the requested version)

- Language switcher stubbed for v1.1.0
- Removed `app/[locale]/layout.tsx`

**Added missing dependency:** `@tailwindcss/postcss` required by the current PostCSS/Tailwind pipeline

**Removed invalid CSS import:** `tw-animate-css` from `globals.css`

**Cleaned stale artifacts:**

- Removed leftover `[locale]` route folder
- Added missing UI components (checkbox, label, textarea, tabs)
- Updated `.gitignore` and workspace settings

## Why

Build was failing due to:

- Unresolved modules (`radix-ui`, missing tailwind postcss plugin, invalid css import)
- Non-installable `next-intl` version

Changes are dependency + import normalization only — **no framework/logic changes** to policy generation behavior intended.

## How to verify

Run locally or in CI:

```bash
npm ci              # Install dependencies
npm run build       # ✅ Should succeed
npm run lint        # ✅ Should pass
```
````

### Lockfiles / workspace

- ✅ Only one lockfile: `policy-factory/package-lock.json`
- ✅ No parent lockfiles in directories above

## Risk / Notes

**Low functional risk:** mostly packaging/import fixes.

Main risk is inconsistency if edits are made in Dropbox and GitHub in parallel. This PR establishes a clean baseline.

## Follow-ups (post-merge)

### i18n decision:

Reintroduce localization intentionally (either correct `next-intl` setup + `app/[locale]` conventions OR defer to v1.1.0)

### Resume original target:

- Framework tuning and mappings (COBIT / ISO27001 / NIST CSF / NIST 800 / FRA)
- Controls library alignment
- Workflow enhancements + generator prompt tuning

## Checklist

- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] No remaining `radix-ui` imports
- [x] No `tw-animate-css` import
- [x] Lockfile is scoped to repo root only
- [x] 19 files changed, 2197 insertions(+), 7346 deletions(-)

## Files Changed

```
.vscode/settings.json (new)
package-lock.json (deleted - parent lockfile)
policy-factory/GITHUB_VERIFICATION.md (new)
policy-factory/PR_INSTRUCTIONS.md (new)
policy-factory/app/[locale]/layout.tsx (deleted)
policy-factory/app/api/generate-policy/route.ts (modified)
policy-factory/app/globals.css (modified)
policy-factory/app/(portal)/generator/page.tsx (modified)
policy-factory/app/(portal)/roadmap/page.tsx (modified)
policy-factory/components/language/language-switcher.tsx (stubbed)
policy-factory/components/ui/checkbox.tsx (new)
policy-factory/components/ui/label.tsx (new)
policy-factory/components/ui/tabs.tsx (new)
policy-factory/components/ui/textarea.tsx (new)
policy-factory/package.json (dependencies updated)
+ others
```

````

---

## 🏷️ Labels to Add

- `build`
- `deps`
- `hotfix`

---

## 🗣️ 30-Second Verbal Summary

**"I stabilized the build by normalizing all shadcn/Radix imports to proper @radix-ui/* packages, removing the non-installable next-intl dependency and invalid tw-animate-css import, and adding the missing @tailwindcss/postcss. Everything is bundled into one atomic PR on fix/build-green so GitHub is the baseline. After merge, we go back to the original objective: framework tuning (COBIT/ISO/NIST/FRA) and controls/workflow improvements — and we can reintroduce i18n intentionally as a separate scoped PR."**

---

## ✅ After PR is Merged

### 1. Tag v1.0.1
```bash
git checkout main
git pull origin main
git tag -a v1.0.1 -m "v1.0.1 - Build fixes: normalized deps and imports"
git push origin v1.0.1
````

### 2. Make GitHub Source of Truth

- ✅ All edits go through GitHub PR workflow
- ✅ Dropbox syncs FROM GitHub (pull only)
- ✅ No parallel editing in Dropbox
- ✅ Everyone branches from GitHub main

### 3. Continue Original Work

- Framework tuning (COBIT/ISO/NIST/FRA)
- Controls library expansion
- Workflow enhancements
- Generator prompt improvements

---

**Ready to go!** Open the PR link, paste the content, and merge when approved. 🚀
