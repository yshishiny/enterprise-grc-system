import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTROLS_PATH = path.join(process.cwd(), 'data', 'control_library.json');
const REGISTER_PATH = path.join(process.cwd(), 'data', 'required_register.json');
const REGISTRY_PATH = path.join(process.cwd(), 'data', 'document_registry.json');
const REGULATORY_PATH = path.join(process.cwd(), 'data', 'regulatory_universe.json');

function loadJson(filePath: string) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const frameworkFilter = searchParams.get('framework'); // e.g., PCI-DSS, CBE, FRA
    const departmentFilter = searchParams.get('department');
    const statusFilter = searchParams.get('status');

    const controlLib = loadJson(CONTROLS_PATH);
    const reqRegister = loadJson(REGISTER_PATH);
    const registry = loadJson(REGISTRY_PATH);
    const regulatory = loadJson(REGULATORY_PATH);

    if (!controlLib || !controlLib.domains) {
      return NextResponse.json({ success: false, error: 'Control library not found' }, { status: 404 });
    }

    // 1. Map Related Policies to Framework Tags & Status
    const policyMap: Record<string, { tags: string[], status: string, department: string }> = {};

    // From Required Register (Tags)
    if (reqRegister?.domains) {
      reqRegister.domains.forEach((d: any) => {
        d.requiredDocuments?.forEach((doc: any) => {
          policyMap[doc.docId] = { 
            tags: doc.frameworks || [], 
            status: 'Missing', 
            department: d.department 
          };
        });
      });
    }

    // From Registry (Status)
    if (registry?.documents) {
      registry.documents.forEach((doc: any) => {
        if (doc.requiredDocId && policyMap[doc.requiredDocId]) {
          policyMap[doc.requiredDocId].status = doc.status;
          // Actual department might differ from required department, use actual if present
          if (doc.department) policyMap[doc.requiredDocId].department = doc.department;
        }
        // Also map standalone docs
        if (!policyMap[doc.id]) { // Use actual ID if not matched to required
           policyMap[doc.id] = { tags: doc.frameworks || [], status: doc.status, department: doc.department };
        }
      });
    }

    // 2. Process Controls & Link Policies dynamically
    let controls = controlLib.domains.flatMap((d: any) => {
      const domainPolicies = Object.values(policyMap).filter((p: any) => 
        // Match by Department or Domain Name (heuristic)
        p.department === d.department || 
        d.name.toLowerCase().includes(p.department.toLowerCase()) // simplistic domain match
      );

      return (d.controls || []).map((c: any) => {
        let relatedPolicies = c.relatedPolicies || []; 
        const derivedFrameworks = new Set<string>();

        // Explicit Framework Mappings
        if (c.mappings?.iso27001) derivedFrameworks.add('ISO27001');
        if (c.mappings?.nist800) derivedFrameworks.add('NIST-800');
        if (c.mappings?.nistCsf) derivedFrameworks.add('NIST-CSF');
        if (c.mappings?.cobit) derivedFrameworks.add('COBIT');
        if (c.mappings?.pci) derivedFrameworks.add('PCI-DSS'); 
        
        // Dynamic Linking: Find policies in this domain that match this framework
        // If relatedPolicies is empty, try to fill it
        if (relatedPolicies.length === 0) {
            // Find candidates from domainPolicies
            const candidates = domainPolicies.filter((p: any) => 
                p.tags?.some((t: string) => 
                    derivedFrameworks.has(t) || 
                    (t === 'PCI-DSS' && (derivedFrameworks.has('PCI-DSS') || c.controlId.startsWith('PCI')))
                )
            );
            
            // Map candidates back to their IDs (we need to reverse lookup or store ID in policyMap)
            // Since policyMap is key->val, we need to iterate entries to find key
            // Optimization: Filter entries of policyMap
            Object.entries(policyMap).forEach(([pid, p]: [string, any]) => {
                if (candidates.includes(p)) {
                     // Check framework match again explicitly
                    const matchesFramework = p.tags?.some((t: string) => 
                        derivedFrameworks.has(t) || 
                        (t === 'PCI-DSS' && c.controlId.startsWith('PCI'))
                    );
                    
                    // Check domain/department match
                    // This creates a loose link: "If Framework matches and Dept matches, show it."
                    if (matchesFramework && (p.department === d.department || p.department === 'IT' && d.department === 'IT')) {
                        if (!relatedPolicies.includes(pid)) relatedPolicies.push(pid);
                    }
                }
            });
        }

        const relatedInfo = relatedPolicies.map((pid: string) => policyMap[pid] || { status: 'Missing', tags: [], department: 'Unknown' });
        
        // Add derived mappings from policies
        relatedInfo.forEach((info: any) => {
          info.tags.forEach((t: string) => derivedFrameworks.add(t));
        });

        // Determine Implementation Status
        let implementationStatus = 'Gap';
        if (relatedInfo.some((i: any) => i.status === 'Approved')) implementationStatus = 'Implemented';
        else if (relatedInfo.some((i: any) => i.status === 'Draft' || i.status === 'Under Review')) implementationStatus = 'In Progress';
        else if (relatedPolicies.length === 0) implementationStatus = 'Not Started';

        return {
          ...c,
          derivedFrameworks: Array.from(derivedFrameworks),
          implementationStatus,
          relatedPolicies, // Return the dynamically populated list
          relatedPolicyStatus: relatedInfo
        };
      });
    });

    // 3. Filter
    if (frameworkFilter) {
      controls = controls.filter((c: any) => 
        c.derivedFrameworks.some((f: string) => f.includes(frameworkFilter)) ||
        // Also check explicit mappings if passing raw code like "iso27001"
        (c.mappings && c.mappings[frameworkFilter.toLowerCase().replace('-', '')])
      );
    }

    if (departmentFilter) {
      controls = controls.filter((c: any) => c.owner === departmentFilter || c.relatedPolicyStatus.some((p: any) => p.department === departmentFilter));
    }

    if (statusFilter) {
       controls = controls.filter((c: any) => c.implementationStatus === statusFilter);
    }

    return NextResponse.json({
      success: true,
      count: controls.length,
      controls
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
