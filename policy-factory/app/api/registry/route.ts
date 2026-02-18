import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'document_registry.json');
const FRAMEWORKS_PATH = path.join(process.cwd(), 'config', 'frameworks.json');
const CONTROLS_PATH = path.join(process.cwd(), 'data', 'control_library.json');
const REGISTER_PATH = path.join(process.cwd(), 'data', 'required_register.json');
const REGULATORY_PATH = path.join(process.cwd(), 'data', 'regulatory_universe.json');

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  return JSON.parse(raw);
}

function loadFrameworks() {
  const raw = fs.readFileSync(FRAMEWORKS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function loadControlLibrary() {
  try {
    const raw = fs.readFileSync(CONTROLS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

function loadRequiredRegister() {
  try {
    const raw = fs.readFileSync(REGISTER_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

function loadRegulatoryUniverse() {
  try {
    const raw = fs.readFileSync(REGULATORY_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

function saveRegistry(data: any) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const registry = loadRegistry();
    const frameworksConfig = loadFrameworks();
    const controlLib = loadControlLibrary();
    const docs = registry.documents;

    // Compute per-department metrics
    const deptMap: Record<string, { policies: any[]; procedures: any[]; approved: number; draft: number; review: number; enhancement: number }> = {};

    for (const doc of docs) {
      const dept = doc.department;
      if (!deptMap[dept]) {
        deptMap[dept] = { policies: [], procedures: [], approved: 0, draft: 0, review: 0, enhancement: 0 };
      }
      if (doc.type === 'policy') deptMap[dept].policies.push(doc);
      else deptMap[dept].procedures.push(doc);

      if (doc.status === 'Approved') deptMap[dept].approved++;
      else if (doc.status === 'Draft') deptMap[dept].draft++;
      else if (doc.status === 'Under Review') deptMap[dept].review++;
      else if (doc.status === 'Enhancement Needed') deptMap[dept].enhancement++;
    }

    const departmentMetrics = Object.entries(deptMap).map(([code, data]) => {
      const totalPolicies = data.policies.length;
      const totalProcedures = data.procedures.length;
      const completedPolicies = data.policies.filter(p => p.status === 'Approved').length;
      const completedProcedures = data.procedures.filter(p => p.status === 'Approved').length;
      const total = totalPolicies + totalProcedures;
      const completed = completedPolicies + completedProcedures;
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      const frameworkSet = new Set<string>();
      [...data.policies, ...data.procedures].forEach(d => d.frameworks?.forEach((f: string) => frameworkSet.add(f)));

      return {
        code,
        totalPolicies, completedPolicies, totalProcedures, completedProcedures,
        completionPct, approved: data.approved, draft: data.draft,
        review: data.review, enhancement: data.enhancement,
        frameworks: Array.from(frameworkSet),
        documents: [...data.policies, ...data.procedures]
      };
    });

    // Overall metrics
    const totalDocs = docs.length;
    const totalApproved = docs.filter((d: any) => d.status === 'Approved').length;
    const totalDraft = docs.filter((d: any) => d.status === 'Draft').length;
    const totalPolicies = docs.filter((d: any) => d.type === 'policy').length;
    const totalProcedures = docs.filter((d: any) => d.type === 'procedure').length;
    const completedPolicies = docs.filter((d: any) => d.type === 'policy' && d.status === 'Approved').length;
    const completedProcedures = docs.filter((d: any) => d.type === 'procedure' && d.status === 'Approved').length;

    // Framework compliance
    const frameworkCompliance = frameworksConfig.frameworks.map((fw: any) => {
      const fwCode = fw.code;
      const taggedDocs = docs.filter((d: any) => d.frameworks?.includes(fwCode));
      const approvedDocs = taggedDocs.filter((d: any) => d.status === 'Approved');
      const draftDocs = taggedDocs.filter((d: any) => d.status === 'Draft');

      const totalControls = fw.totalControls || fw.annexAControls || 
        (fw.laws ? fw.laws.reduce((sum: number, l: any) => sum + (l.articles || 0), 0) : 0);
      
      const controlsPerDoc = totalControls > 0 ? Math.ceil(totalControls / Math.max(taggedDocs.length, 1)) : 1;
      const implementedControls = Math.min(approvedDocs.length * controlsPerDoc, totalControls);
      const coveragePct = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0;

      return {
        code: fwCode,
        name: fw.name,
        version: fw.version,
        description: fw.description,
        totalControls,
        implementedControls,
        coveragePct,
        totalDocs: taggedDocs.length,
        approvedDocs: approvedDocs.length,
        draftDocs: draftDocs.length,
        maturityLevel: fw.maturityLevel || 0,
        laws: fw.laws || null,
        domains: fw.domains || null,
        functions: fw.functions || null
      };
    });

    const avgFrameworkCompliance = frameworkCompliance.length > 0
      ? Math.round(frameworkCompliance.reduce((sum: number, f: any) => sum + f.coveragePct, 0) / frameworkCompliance.length)
      : 0;

    // Control library maturity
    let controlMaturity = null;
    if (controlLib?.domains) {
      const domains = controlLib.domains.map((d: any) => {
        const controls = d.controls || [];
        const avgCurrent = controls.length > 0 ? controls.reduce((s: number, c: any) => s + (c.maturity?.current || 0), 0) / controls.length : 0;
        const avgTarget = controls.length > 0 ? controls.reduce((s: number, c: any) => s + (c.maturity?.target || 0), 0) / controls.length : 0;
        return {
          id: d.id, name: d.name, isoTheme: d.isoTheme,
          totalControls: controls.length,
          avgCurrentMaturity: Math.round(avgCurrent * 10) / 10,
          avgTargetMaturity: Math.round(avgTarget * 10) / 10,
          gap: Math.round((avgTarget - avgCurrent) * 10) / 10
        };
      });
      const allControls = controlLib.domains.flatMap((d: any) => d.controls || []);
      const totalControls = allControls.length;
      const avgCurrent = totalControls > 0 ? Math.round(allControls.reduce((s: number, c: any) => s + (c.maturity?.current || 0), 0) / totalControls * 10) / 10 : 0;
      const avgTarget = totalControls > 0 ? Math.round(allControls.reduce((s: number, c: any) => s + (c.maturity?.target || 0), 0) / totalControls * 10) / 10 : 0;
      controlMaturity = { totalControls, avgCurrentMaturity: avgCurrent, avgTargetMaturity: avgTarget, gap: Math.round((avgTarget - avgCurrent) * 10) / 10, domains };
    }

    // 4-metric scoring
    const reqRegister = loadRequiredRegister();
    let completionScoring: any = null;
    let missingDocs: any[] = [];
    if (reqRegister?.domains) {
      const allRequired = reqRegister.domains.flatMap((d: any) =>
        (d.requiredDocuments || []).map((rd: any) => ({ ...rd, domain: d.name, domainId: d.domainId, department: d.department }))
      );
      const totalRequired = allRequired.length;
      const matched = allRequired.map((rd: any) => {
        const found = docs.find((d: any) => d.requiredDocId === rd.docId);
        return { ...rd, matched: !!found, matchedDoc: found || null };
      });
      const present = matched.filter((m: any) => m.matched);
      const approved = present.filter((m: any) => m.matchedDoc?.status === 'Approved');
      const mapped = present.filter((m: any) => m.matchedDoc?.frameworks?.length > 0 || m.matchedDoc?.controls?.length > 0);
      missingDocs = matched.filter((m: any) => !m.matched).map((m: any) => ({
        docId: m.docId, title: m.title, type: m.type, domain: m.domain,
        department: m.department, priority: m.priority, frameworks: m.frameworks
      }));
      completionScoring = {
        totalRequired,
        present: present.length,
        coveragePct: totalRequired > 0 ? Math.round((present.length / totalRequired) * 100) : 0,
        approvalPct: totalRequired > 0 ? Math.round((approved.length / totalRequired) * 100) : 0,
        mappingPct: totalRequired > 0 ? Math.round((mapped.length / totalRequired) * 100) : 0,
        evidenceReadinessPct: controlMaturity ? Math.round((controlMaturity.avgCurrentMaturity / controlMaturity.avgTargetMaturity) * 100) : 0,
        missingCount: missingDocs.length,
        
        // New Metric: Compliance Readiness %
        complianceReadinessPct: totalRequired > 0 ? Math.round(
          matched.reduce((sum: number, m: any) => {
            if (!m.matched || !m.matchedDoc) return sum; // 0 points if missing
            
            let score = 25; // Base existence score
            const d = m.matchedDoc;

            // Metadata (15%): Check if key fields exist
            if (d.id && d.title && d.version && d.lastUpdated) score += 15;

            // Approval (25%): status must be Approved
            if (d.status === 'Approved') score += 25;

            // Mapping (20%): Has frameworks or controls mapped
            if ((d.frameworks && d.frameworks.length > 0) || (d.controls && d.controls.length > 0)) score += 20;

            // Evidence (15%): For now, we use a placeholder or check if 'evidence' field exists
            // In future this can link to Evidence Index
            if (d.evidenceLocation || d.controls?.some((c:any) => c.evidence)) score += 15;

            return sum + score;
          }, 0) / totalRequired
        ) : 0
      };
    }

    // Regulatory Universe Integration
    const regUniverse = loadRegulatoryUniverse();
    let regulatoryCompliance = null;
    
    if (regUniverse?.laws) {
      const presentReqIds = new Set(docs.map((d: any) => d.requiredDocId).filter(Boolean));
      
      const laws = regUniverse.laws.map((law: any) => {
        const articles = law.articles.map((art: any) => {
          const isImplemented = art.relatedDocIds?.some((id: string) => presentReqIds.has(id));
          return {
            ...art,
            complianceStatus: isImplemented ? "Implemented" : "Gap",
            implementedDocs: art.relatedDocIds?.filter((id: string) => presentReqIds.has(id)) || []
          };
        });
        
        const totalArts = articles.length;
        const implementedArts = articles.filter((a: any) => a.complianceStatus === "Implemented").length;
        const coveragePct = totalArts > 0 ? Math.round((implementedArts / totalArts) * 100) : 0;
        
        return { ...law, articles, coveragePct, totalArticles: totalArts, implementedArticles: implementedArts };
      });
      
      const totalLaws = laws.length;
      const totalArticles = laws.reduce((sum: number, l: any) => sum + l.totalArticles, 0);
      const totalImplemented = laws.reduce((sum: number, l: any) => sum + l.implementedArticles, 0);
      
      regulatoryCompliance = {
        totalLaws,
        totalArticles,
        totalImplemented,
        overallCoveragePct: totalArticles > 0 ? Math.round((totalImplemented / totalArticles) * 100) : 0,
        laws
      };
    }

    return NextResponse.json({
      success: true,
      lastUpdated: registry.lastUpdated,
      overall: {
        totalDocuments: totalDocs,
        totalApproved, totalDraft, totalPolicies, completedPolicies,
        policyCompletionPct: totalPolicies > 0 ? Math.round((completedPolicies / totalPolicies) * 100) : 0,
        totalProcedures, completedProcedures,
        procedureCompletionPct: totalProcedures > 0 ? Math.round((completedProcedures / totalProcedures) * 100) : 0,
        overallCompletionPct: totalDocs > 0 ? Math.round((totalApproved / totalDocs) * 100) : 0,
        frameworkCompliancePct: avgFrameworkCompliance,
        inventoryCompletionPct: completionScoring?.coveragePct ?? 100,
        coveragePct: completionScoring?.coveragePct ?? avgFrameworkCompliance,
        regulatoryCoveragePct: regulatoryCompliance?.overallCoveragePct ?? 0
      },
      departments: departmentMetrics,
      frameworks: frameworkCompliance,
      controlMaturity,
      completionScoring,
      missingDocuments: missingDocs,
      regulatoryCompliance,
      documents: docs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, status, department, notes, validatedBy } = body;

    if (!documentId || !status) {
      return NextResponse.json({ success: false, error: 'documentId and status are required' }, { status: 400 });
    }

    const validStatuses = ['Approved', 'Draft', 'Under Review', 'Enhancement Needed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const registry = loadRegistry();
    const docIndex = registry.documents.findIndex((d: any) => d.id === documentId);

    if (docIndex === -1) {
      return NextResponse.json({ success: false, error: `Document ${documentId} not found` }, { status: 404 });
    }

    registry.documents[docIndex].status = status;
    registry.documents[docIndex].validatedBy = validatedBy || 'User';
    registry.documents[docIndex].validatedAt = new Date().toISOString().slice(0, 10);

    if (department) registry.documents[docIndex].department = department;
    if (notes) registry.documents[docIndex].systemNotes = notes;

    registry.lastUpdated = new Date().toISOString();
    saveRegistry(registry);

    return NextResponse.json({ success: true, document: registry.documents[docIndex] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
