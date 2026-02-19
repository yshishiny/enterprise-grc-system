# Shari GRC System - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Docker Deployment (Recommended)

**Prerequisites:**

- Docker installed and running
- Docker Compose installed

**Steps:**

```bash
# 1. Build and start the container
docker-compose up -d --build

# 2. Check container status
docker-compose ps

# 3. View logs
docker-compose logs -f

# 4. Access the application
# Open browser: http://localhost:3000
```

**Stop the application:**

```bash
docker-compose down
```

---

### Option 2: Production Build (Node.js)

**Prerequisites:**

- Node.js 20+ installed
- npm installed

**Steps:**

```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Build the application
npm run build

# 4. Start production server
npm start

# Access: http://localhost:3000
```

---

### Option 3: Development Mode

```bash
# Start development server with hot reload
npm run dev

# Access: http://localhost:3000
```

---

## 🌐 Deployment to Cloud Platforms

### Vercel (Easiest for Next.js)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure environment variables
5. Deploy!

**Environment Variables needed:**

```
DATABASE_URL=file:./data/dev.db
NODE_ENV=production
```

---

### Docker Hub / Container Registry

```bash
# 1. Build image
docker build -t sharifinance/grc-system:latest .

# 2. Tag image
docker tag sharifinance/grc-system:latest your-registry/grc-system:latest

# 3. Push to registry
docker push your-registry/grc-system:latest

# 4. Deploy to your server
docker pull your-registry/grc-system:latest
docker run -d -p 3000:3000 --name grc-system your-registry/grc-system:latest
```

---

## 📋 System Requirements

**Minimum:**

- 1 CPU core
- 512 MB RAM
- 1 GB disk space

**Recommended:**

- 2 CPU cores
- 2 GB RAM
- 5 GB disk space

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL="file:./data/dev.db"

# Application
NODE_ENV=production
PORT=3000

# Security (for production)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

# AI Integation
LM_STUDIO_URL=http://host.docker.internal:1234
GITHUB_TOKEN=your-github-token-here
```

---

## 🗄️ Database Setup

The system uses SQLite for simplicity:

```bash
# Initialize database
npx prisma migrate deploy

# (Optional) Seed with sample data
npx prisma db seed
```

---

## 📊 Features Included in Deployment

✅ **Enhanced Dashboard**

- 8 Departments
- 5 Framework compliance trackers
- Company-wide metrics

✅ **Document Library**

- 10 Professional subject areas
- 145 documents classified
- Gap analysis with priorities

✅ **Approval Workflow**

- 5-stage approval process
- 4 user roles
- Workflow visualization

✅ **Policy Templates**

- 8 professional templates
- Quick document creation

✅ **Bilingual Support**

- English and Arabic (العربية)
- RTL layout for Arabic
- Language switcher

✅ **Strategic Roadmap**

- 2026 quarterly plan
- Priority-based tracking

---

## 🎨 Shari Branding

The system features Shari for Microfinance branding:

- **Primary:** Purple (#662D91)
- **Secondary:** Teal (#00BCD4)
- **Accent:** Orange (#f97316)

---

## 🔒 Security Considerations

**For Production:**

1. Change default database credentials
2. Set strong NEXTAUTH_SECRET
3. Enable HTTPS
4. Configure CORS properly
5. Set up proper authentication
6. Regular security updates

---

## 📱 Access Points

After deployment, access these URLs:

- **Dashboard:** `/dashboard` or `/ar/dashboard` (Arabic)
- **Document Library:** `/library`
- **Approvals:** `/approvals`
- **Templates:** `/templates`
- **Roadmap:** `/roadmap`
- **Departments:** `/departments/{code}`
- **Frameworks:** `/frameworks/{code}`

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database errors

```bash
# Reset database
rm -rf data/dev.db
npx prisma migrate deploy
```

### Port already in use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

---

## 📞 Support

For issues or questions about the GRC system:

- Review the walkthrough documentation
- Check the task tracker for implementation details
- Contact: IT Department

---

**System Version:** Phase 5B (Bilingual Support)  
**Last Updated:** February 2026  
**Built with:** Next.js, React, Tailwind CSS, Shadcn UI
