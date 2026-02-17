# Enterprise GRC System

**Version:** 1.0.0  
**Organization:** Shari for Microfinance  
**Status:** Production-Ready

## 🎯 Overview

Enterprise Governance, Risk & Compliance (GRC) system built with Next.js, featuring:

- **24 Interconnected Pages** across all governance domains
- **566 Controls Tracked** (FRA, COBIT, NIST 800-53, NIST CSF, ISO 27001)
- **145 Documents Classified** in 10 professional subject areas
- **AI-Powered Policy Generation** with framework integration
- **Multi-Stage Approval Workflow** system
- **Bilingual Support** (English/Arabic with RTL)
- **Version Control** and history tracking

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser: http://localhost:3000/dashboard
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

### Docker

```bash
# Using Docker Compose
docker-compose up -d

# Access: http://localhost:3000
```

## 📊 Features

### Core System (Phases 1-4)

- ✅ Enhanced Dashboard with company-wide metrics
- ✅ 8 Department pages (IT, HR, Ops, Commercial, Risk, Audit, BOD, Admin)
- ✅ 5 Framework compliance trackers
- ✅ Document Library (10 subjects, 145 docs)
- ✅ Gap Analysis with priorities
- ✅ Strategic Roadmap for 2026

### Advanced Features (Phase 5)

- ✅ **Multi-Stage Approval Workflow** - 5 stages, 4 roles
- ✅ **AI Policy Generator** - Framework-aware content generation
- ✅ **Policy Templates** - 8 professional templates
- ✅ **Version Control** - Full history tracking
- ✅ **Bilingual Support** - English/Arabic (partial)
- ✅ **Shari Branding** - Purple/Teal/Orange theme

## 🎨 Shari Branding

- **Primary:** Purple #662D91
- **Secondary:** Teal #00BCD4
- **Accent:** Orange #f97316

## 📁 Project Structure

```
policy-factory/
├── app/
│   ├── (portal)/          # Main application pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── departments/   # 8 department pages
│   │   ├── frameworks/    # 5 framework pages
│   │   ├── library/       # Document library
│   │   ├── approvals/     # Approval workflow
│   │   ├── templates/     # Template library
│   │   ├── generator/     # AI policy generator
│   │   └── roadmap/       # Strategic roadmap
│   └── api/
│       └── generate-policy/  # AI generation API
├── components/            # Reusable components
├── config/               # Data configuration files
└── messages/             # i18n translations
```

## 🔧 Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **UI Library:** Shadcn UI + Radix UI
- **Styling:** Tailwind CSS 4
- **Database:** SQLite (Prisma ORM)
- **i18n:** next-intl
- **Icons:** Lucide React
- **Charts:** Recharts

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
- **[ENVIRONMENTS.md](ENVIRONMENTS.md)** - Environment configuration
- **[PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)** - Feature status

## 🌐 Key Pages

| Page             | Route        | Description                |
| ---------------- | ------------ | -------------------------- |
| Dashboard        | `/dashboard` | Company-wide metrics       |
| Document Library | `/library`   | 145 documents, 10 subjects |
| Approvals        | `/approvals` | Workflow dashboard         |
| AI Generator     | `/generator` | Policy generation          |
| Templates        | `/templates` | 8 policy templates         |
| Roadmap          | `/roadmap`   | 2026 strategic plan        |

## 🔐 Environment Variables

```bash
# .env.local
NODE_ENV=development
DATABASE_URL=file:./data/dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📈 System Metrics

- **Pages:** 24
- **Controls:** 566 across 5 frameworks
- **Documents:** 145 classified
- **Templates:** 8 professional
- **Departments:** 8
- **Frameworks:** 5 (FRA, COBIT, NIST 800-53, NIST CSF, ISO 27001)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
```

## 🚢 Deployment

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.**

Quick options:

- **Vercel:** Connect GitHub repo → Auto-deploy
- **Docker:** `docker-compose up -d`
- **VPS:** `npm run build && npm start`

## 📝 Version

**Current:** v1.0.0 (February 2026)

**Release Notes:**

- Complete core GRC system (Phases 1-4)
- Multi-stage approval workflow
- AI-powered policy generator
- Professional policy templates
- Version control system
- Shari branding applied

## 🤝 Contributing

This is a private enterprise system for Shari for Microfinance.

## 📄 License

MIT License - Shari for Microfinance

---

**Built with ❤️ for Enterprise Governance**
