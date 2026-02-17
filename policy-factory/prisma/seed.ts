import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import departmentConfig from '../config/departments.json'
import roleConfig from '../config/roles.json'
import backlogConfig from '../config/backlog.json'
import controlsConfig from '../config/controls.json'
import documentTypesConfig from '../config/document_types.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Shari Database...')

  // 1. Seed Users & Roles (Mock AD)
  const users = [
    { name: "Yasser Admin", email: "admin@shari.com", role: "SystemAdmin", dept: "IT" },
    { name: "GRC Manager", email: "grc@shari.com", role: "Reviewer_GRC", dept: "Governance & Compliance (GRC)" },
    { name: "Risk Officer", email: "risk@shari.com", role: "Reviewer_Risk", dept: "Risk" },
    { name: "AML Officer", email: "aml@shari.com", role: "Reviewer_AML", dept: "AML" },
    { name: "Credit Head", email: "credit@shari.com", role: "Approver", dept: "Commercial" },
    { name: "Finance Head", email: "finance@shari.com", role: "Approver", dept: "Finance" },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        department: u.dept,
        role: u.role,
        adGroups: (roleConfig as any).ad_group_mapping.find((m: any) => m.role === u.role)?.ad_group || "SHARI-USER"
      }
    })
  }

  // 2. Seed Controls
  console.log('Seeding Controls...')
  for (const c of (controlsConfig as any).controls) {
    await prisma.control.upsert({
      where: { controlId: c.id },
      update: {
        title: c.title,
        type: c.type,
        frequency: c.frequency,
        kpiDefinition: JSON.stringify(c.kpi)
      },
      create: {
        controlId: c.id,
        title: c.title,
        type: c.type,
        frequency: c.frequency,
        evidenceRequired: "Detailed evidence required per policy",
        ownerRole: "DepartmentHead", // Default
        kpiDefinition: JSON.stringify(c.kpi)
      }
    })
  }

  // 3. Seed Draft Documents
  console.log('Seeding Draft Documents...')
  const draftsDir = path.join(__dirname, '../content/drafts')
  if (fs.existsSync(draftsDir)) {
    const files = fs.readdirSync(draftsDir)
    const owner = await prisma.user.findUnique({ where: { email: "grc@shari.com" } }) // Default owner
    
    if (owner) {
      for (const file of files) {
        if (!file.endsWith('.md')) continue
        
        try {
          const content = fs.readFileSync(path.join(draftsDir, file), 'utf8')
          // Simple frontmatter parsing
          const codeMatch = content.match(/code:\s*(.*)/)
          const titleMatch = content.match(/title:\s*(.*)/)
          
          const docNo = codeMatch ? codeMatch[1].trim() : file.replace('.md', '')
          const title = titleMatch ? titleMatch[1].trim() : "Untitled"
          
          // Determine type based on prefix
          let type = 'Policy'
          if (docNo.startsWith('PROC')) type = 'Procedure'
          
          // Determine department based on simple mapping
          let dept = "GRC"
          if (docNo.includes('CRD') || docNo.includes('Commercial')) dept = "Commercial"
          if (docNo.includes('AML')) dept = "AML"
          if (docNo.includes('PRT') || docNo.includes('Partnerships')) dept = "Partnerships"
          if (docNo.includes('FIN')) dept = "Finance"
          if (docNo.includes('OPS')) dept = "Operations" // Map OPS to Operations
          if (docNo.includes('COM')) dept = "GRC"        // Map COM to GRC (Compliance/Protection)

          await prisma.document.upsert({
            where: { documentNo: docNo },
            update: { content, title, type, departmentOwner: dept },
            create: {
               documentNo: docNo,
               title: title,
               type: type,
               status: 'Draft',
               version: 'v0.1',
               departmentOwner: dept,
               scope: 'Enterprise',
               content: content,
               owner: { connect: { id: owner.id } }
            }
          })
        } catch (err) {
          console.error(`Error processing ${file}:`, err)
        }
      }
    }
  }

  // 4. Seed Backlog (as Drafts with placeholder content if not exists)
  console.log('Seeding Backlog Placeholders...')
  const allPriorities = [
      ...(backlogConfig as any).priorities.P0,
      ...(backlogConfig as any).priorities.P1,
      ...(backlogConfig as any).priorities.P2
  ]
  
  for (const p of allPriorities) {
      try {
        const exists = await prisma.document.findUnique({ where: { documentNo: p.code } })
        if (!exists) {
            const owner = await prisma.user.findFirst({ 
              where: { 
                OR: [
                  { department: { contains: p.domain } },
                  { email: "grc@shari.com" }
                ]
              } 
            })
            if (owner) {
              await prisma.document.create({
                  data: {
                      documentNo: p.code,
                      title: p.title,
                      type: p.type,
                      status: 'Draft',
                      version: 'v0.0', // Backlog item
                      departmentOwner: p.domain,
                      scope: 'Enterprise',
                      content: "# Placeholder for " + p.title + "\n\nTo be drafted based on Shari template.",
                      ownerId: owner.id
                  }
              })
            }
        }
      } catch (err) {
        console.error(`Error seeding backlog item ${p.code}:`, err)
      }
  }

  console.log('Seeding Completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
