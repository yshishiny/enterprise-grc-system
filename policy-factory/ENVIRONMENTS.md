# GRC System - Environment Configuration

## 🔧 Environments

### Development Environment

- **URL:** http://localhost:3000
- **Command:** `npm run dev`
- **Purpose:** Local development with hot reload
- **Status:** ✅ Running
- **Database:** SQLite (dev.db)

### Production Environment

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Port:** 3000 (configurable via PORT env var)
- **Optimization:** Full Next.js production build
- **Database:** SQLite (production.db)

---

## 📦 Current Version: v1.0.0

**Release Name:** "Phase 5 Complete - Enterprise GRC"

**Release Date:** February 17, 2026

**Features Included:**

- ✅ Enhanced Dashboard with 8 departments
- ✅ 5 Framework compliance trackers
- ✅ Document Library (145 docs, 10 subjects)
- ✅ Gap Analysis & Roadmap
- ✅ Approval Workflow System
- ✅ Policy Template Library
- ✅ AI Policy Generator
- ✅ Bilingual Support (EN/AR)
- ✅ Version Control System
- ✅ Shari Branding

---

## 🌿 Git Branches

### Main Branch (`main`)

- **Purpose:** Production-ready code
- **Protection:** Requires review
- **Deployment:** Auto-deploy to production
- **Version Tag:** v1.0.0

### Development Branch (`develop`)

- **Purpose:** Integration branch for features
- **Testing:** All features tested before merge to main

### Feature Branches

- Format: `feature/feature-name`
- Merge to: `develop`

---

## 🚀 Deployment Workflow

### Step 1: Commit Changes

```bash
git add .
git commit -m "Release v1.0.0 - Phase 5 Complete"
```

### Step 2: Tag Version

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Enterprise GRC Phase 5"
```

### Step 3: Push to GitHub

```bash
git push origin main
git push origin v1.0.0
```

### Step 4: Build Production

```bash
npm run build
npm start
```

---

## 📋 Version History

### v1.0.0 (Current) - February 17, 2026

**Phase 5 Complete - All Advanced Features**

**Features:**

- Multi-stage approval workflow
- AI-powered policy generator
- Bilingual support (English/Arabic)
- Version control system
- 8 policy templates
- Shari branding applied

**Metrics:**

- 24 pages
- 566 controls tracked
- 145 documents classified
- 5 frameworks integrated

---

## 🔐 Environment Variables

### Development (.env.local)

```
NODE_ENV=development
DATABASE_URL=file:./data/dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (.env.production)

```
NODE_ENV=production
DATABASE_URL=file:./data/production.db
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t grc-system:v1.0.0 .
```

### Run Container

```bash
docker run -d -p 3000:3000 --name grc-system grc-system:v1.0.0
```

### Docker Compose

```bash
docker-compose up -d
```

---

## ✅ Production Checklist

Before deploying to production:

- [x] All features implemented
- [x] Code committed to git
- [x] Version tagged (v1.0.0)
- [ ] Build successful (`npm run build`)
- [ ] Tests passing
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Pushed to GitHub main branch
- [ ] Production deployment verified

---

**Current Status:**

- **Dev:** ✅ Running on localhost:3000
- **Prod:** ⏳ Ready to build and deploy
- **Git:** ⏳ Ready to commit and push
