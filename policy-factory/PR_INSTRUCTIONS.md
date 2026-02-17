# Build Fix PR - Instructions

## ✅ PR Successfully Pushed!

**Branch:** `fix/build-green`
**Commit:** b234b98
**PR Link:** https://github.com/yshishiny/enterprise-grc-system/pull/new/fix/build-green

---

## Create the PR on GitHub

### 1. Visit the PR Creation Link

Click: https://github.com/yshishiny/enterprise-grc-system/pull/new/fix/build-green

### 2. Fill in PR Details

**Title:**

```
fix(build): normalize shadcn/radix imports, remove broken deps, clean globals.css
```

**Description:**

````markdown
## Problem

Build was failing due to:

- Incorrect Radix imports (`radix-ui` instead of `@radix-ui/react-*`)
- Broken `next-intl` dependency (npm couldn't resolve version)
- Invalid `tw-animate-css` CSS import
- Missing `@tailwindcss/postcss` dependency

## Solution

- Fixed shadcn/Radix imports: changed from 'radix-ui' to '@radix-ui/react-\*'
- Added missing @radix-ui/react-scroll-area and @tailwindcss/postcss
- Removed broken next-intl dependency (deferred to v1.1.0)
- Removed invalid tw-animate-css import from globals.css
- Cleaned up language-switcher to stub for v1.1.0
- Removed stale [locale] route folder

## Checklist

- [x] npm ci works
- [x] npm run build succeeds
- [x] Only one lockfile exists (policy-factory/package-lock.json)
- [x] No radix-ui imports remain (all @radix-ui/\*)
- [x] tw-animate-css import removed
- [x] i18n decision deferred / tracked for v1.1.0

## Testing

```bash
npm ci
npm run build  # ✅ SUCCESS
```
````

## Files Changed

19 files changed, 2197 insertions(+), 7346 deletions(-)

## Impact

- Build now succeeds cleanly
- GitHub becomes single source of truth
- Ready for v1.0.1 tag after merge

````

**Labels to Add:**
- `build`
- `deps`
- `hotfix`

### 3. Create Pull Request
Click **"Create pull request"**

---

## After PR is Merged

### Tag v1.0.1

```bash
git checkout main
git pull origin main
git tag -a v1.0.1 -m "v1.0.1 - Build fixes

- Normalized shadcn/Radix imports
- Removed broken dependencies
- Build now succeeds cleanly"
git push origin v1.0.1
````

### Create GitHub Release

1. Go to: https://github.com/yshishiny/enterprise-grc-system/releases/new
2. Choose tag: `v1.0.1`
3. Release title: `v1.0.1 - Build Fixes`
4. Description:

````markdown
## Build Fixes

Fixed critical build issues to ensure clean compilation:

### Changes

- ✅ Normalized shadcn/Radix imports to `@radix-ui/react-*`
- ✅ Removed broken `next-intl` dependency
- ✅ Added missing `@tailwindcss/postcss`
- ✅ Removed invalid `tw-animate-css` import
- ✅ Cleaned up stale files and cache

### Build Status

```bash
npm ci       # ✅ SUCCESS
npm run build # ✅ SUCCESS
```
````

### Note

Bilingual support (next-intl) temporarily removed - will be re-implemented properly in v1.1.0.

**Previous:** [v1.0.0](https://github.com/yshishiny/enterprise-grc-system/releases/tag/v1.0.0)

```

---

## Summary

**Current State:**
- ✅ v1.0.0 deployed on main
- ✅ Build fixes committed to `fix/build-green`
- ✅ Branch pushed to GitHub
- ⏳ PR awaiting creation

**Next:**
1. Create PR on GitHub
2. Merge PR
3. Tag v1.0.1
4. Continue with framework tuning & enhancements
```
