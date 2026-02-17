import { NextResponse } from "next/server"

function getCategoryCode(category: string) {
  const map: Record<string, string> = {
    Governance: "GOV",
    Risk: "RISK",
    Compliance: "COMP",
    "Information Security": "INFOSEC",
    "IT Governance": "ITG",
    "Human Resources": "HR",
    Operations: "OPS",
    Finance: "FIN",
    "Internal Audit": "AUDIT",
    Administration: "ADMIN",
  }
  return map[category] ?? "GEN"
}

type GeneratePolicyRequest = {
  category: string
  title: string
  purpose?: string
  department?: string
  frameworks?: string[]
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeneratePolicyRequest
    const category = body.category?.trim() || "Governance"
    const title = body.title?.trim() || "Untitled Policy"
    const purpose = body.purpose?.trim() || ""
    const department = body.department?.trim() || ""
    const frameworks = Array.isArray(body.frameworks) ? body.frameworks : []

    const markdown = `# ${title}

**Policy Code:** POL-${getCategoryCode(category)}-XXX  
**Category:** ${category}  
**Owner Department:** ${department || "TBD"}  
**Effective Date:** ${new Date().toISOString().slice(0, 10)}  
**Version:** 1.0  

---

## 1. Purpose
${purpose || "Define the purpose of this policy."}

## 2. Scope
Define the scope (systems, people, processes, locations, branches).

## 3. Framework Alignment
This policy supports the following frameworks:
${frameworks.length ? frameworks.map((f) => `- ${f}`).join("\n") : "- TBD"}

## 4. Roles & Responsibilities
- **Author:** TBD
- **Reviewer:** TBD
- **Approver:** TBD
- **Policy Owner:** ${department || "TBD"}

## 5. Policy Requirements
1) Requirement statement 1  
2) Requirement statement 2  
3) Requirement statement 3  

## 6. Monitoring & Compliance
- Evidence collection method: tickets, logs, approvals, reports.
- Review cadence: quarterly or as required.

## 7. Non-Compliance
Non-compliance may result in corrective action as per HR/disciplinary process.

## 8. Related Documents
- Standards / Procedures: TBD
- Records / Templates: TBD

## 9. Revision History
| Version | Date | Description | Author | Approver |
|---|---|---|---|---|
| 1.0 | ${new Date().toISOString().slice(0, 10)} | Initial release | TBD | TBD |
`

    return NextResponse.json({ ok: true, markdown })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 400 }
    )
  }
}
