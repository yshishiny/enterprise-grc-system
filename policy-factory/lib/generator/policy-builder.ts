// Deterministic Policy Builder
// Generates policies from structured control data

import { Control, Policy, PolicyStatement, PolicyGenerationRequest, PolicyGenerationResult } from '@/lib/types';
import { loadControlsByFrameworksAndCategory } from '@/lib/frameworks/loader';

/**
 * Generate policy code from category
 */
function generatePolicyCode(category: string): string {
  const codes: Record<string, string> = {
    'Governance & Board': 'GOV',
    'Risk Management': 'RISK',
    'Compliance & Regulatory': 'COMP',
    'Information Security': 'INFOSEC',
    'IT Governance': 'ITG',
    'Human Resources': 'HR',
    'Operations': 'OPS',
    'Finance': 'FIN',
    'Internal Audit': 'AUDIT',
    'Administration': 'ADMIN'
  };
  
  const prefix = codes[category] || 'GEN';
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `POL-${prefix}-${seq}`;
}

/**
 * Build policy statements from controls
 */
function buildPolicyStatements(controls: Control[]): PolicyStatement[] {
  return controls.map((control, idx) => ({
    id: `stmt-${idx + 1}`,
    statement: `The organization shall ${control.objective.toLowerCase()}`,
    controlIds: [control.id]
  }));
}

/**
 * Build requirements section from controls
 */
function buildRequirements(controls: Control[]): string[] {
  const requirements: string[] = [];
  
  controls.forEach(control => {
    requirements.push(`**${control.title}**: ${control.description}`);
  });
  
  return requirements;
}

/**
 * Build framework compliance section
 */
function buildFrameworkSection(controls: Control[], frameworks: string[]): string {
  let section = '';
  
  frameworks.forEach(fw => {
    const mappings = controls.flatMap(c => 
      c.mappings.filter(m => m.framework === fw)
    );
    
    if (mappings.length > 0) {
      section += `\n### ${fw}\n`;
      section += `This policy implements the following ${fw} controls:\n\n`;
      mappings.forEach(m => {
        section += `- **${m.controlCode}**: Referenced in organizational controls\n`;
      });
    }
  });
  
  return section;
}

/**
 * Render policy as markdown
 */
function renderPolicyMarkdown(policy: Policy, controls: Control[], frameworks: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  const reviewDate = new Date();
  reviewDate.setFullYear(reviewDate.getFullYear() + 1);
  
  return `# ${policy.title}

**Policy Code:** ${policy.code}  
**Category:** ${policy.category}  
**Owner Department:** ${policy.owner}  
**Effective Date:** ${today}  
**Review Date:** ${reviewDate.toISOString().split('T')[0]}  
**Version:** 1.0  
**Status:** Draft

---

## 1. Purpose

${policy.purpose}

This policy ensures compliance with applicable regulatory frameworks and establishes controls to:
${controls.map(c => `- ${c.objective}`).join('\n')}

---

## 2. Scope

This policy applies to:
- All employees, contractors, and third parties
- ${policy.owner} (primary responsibility)
- All organizational systems and data

---

## 3. Framework Alignment

This policy supports compliance with:
${frameworks.map(fw => `- **${fw}**`).join('\n')}
${buildFrameworkSection(controls, frameworks)}

---

## 4. Policy Statements

${policy.statements.map((stmt, idx) => `${idx + 1}. ${stmt.statement}`).join('\n')}

---

## 5. Requirements

${policy.requirements.map((req, idx) => `### 5.${idx + 1} ${req.split(':')[0]}\n\n${req.split(':').slice(1).join(':')}` ).join('\n\n')}

---

## 6. Roles & Responsibilities

**Policy Owner:** ${policy.owner}
- Maintain and update this policy
- Ensure compliance monitoring
- Report violations

**Department Heads:**
- Implement policy requirements
- Train staff
- Document compliance

**All Staff:**
- Comply with policy requirements
- Report concerns or violations
- Complete required training

---

## 7. Monitoring & Evidence

The following evidence must be maintained:

${controls.flatMap(c => c.evidenceRequired).map((ev, idx) => `${idx + 1}. ${ev}`).join('\n')}

**Review Frequency:** ${policy.reviewFrequency}

---

## 8. Non-Compliance

Violations of this policy may result in:
- Disciplinary action (up to termination)
- Legal consequences
- Regulatory sanctions
- Reputational damage

---

## 9. Related Controls

This policy implements the following organizational controls:

${controls.map(c => `- **${c.code}** - ${c.title}`).join('\n')}

---

## 10. Exceptions

Exceptions to this policy must be:
- Documented in writing
- Approved by ${policy.approver || 'Senior Management'}
- Reviewed periodically
- Time-limited

---

## 11. Revision History

| Version | Date | Description | Author | Approver |
|---------|------|-------------|--------|----------|
| 1.0 | ${today} | Initial release | AI Generator | TBD |

---

**Approval Signatures:**

**Prepared by:** ${policy.owner}  
**Reviewed by:** TBD  
**Approved by:** ${policy.approver || 'TBD'}  

---

*This policy was generated using structured framework mappings and control data. Please review and customize before submission for approval.*
`;
}

/**
 * Build complete policy from request
 */
export async function buildPolicy(request: PolicyGenerationRequest): Promise<PolicyGenerationResult> {
  // Load relevant controls
  const controls = loadControlsByFrameworksAndCategory(
    request.frameworks,
    request.category
  );
  
  if (controls.length === 0) {
    throw new Error(`No controls found for category "${request.category}" and frameworks ${request.frameworks.join(', ')}`);
  }
  
  // Build policy structure
  const policy: Policy = {
    code: generatePolicyCode(request.category),
    title: request.title,
    category: request.category,
    scope: 'Organization-wide',
    purpose: request.purpose,
    statements: buildPolicyStatements(controls),
    requirements: buildRequirements(controls),
    exceptions: [],
    enforcement: 'Mandatory',
    mappedControls: controls.map(c => c.id),
    frameworks: request.frameworks,
    owner: request.department || 'TBD',
    approver: 'TBD',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reviewFrequency: controls.some(c => c.priority === 'P0') ? 'Annual' : 'Bi-annual',
    version: '1.0',
    status: 'Draft'
  };
  
  // Render as markdown
  const markdown = renderPolicyMarkdown(policy, controls, request.frameworks);
  
  return {
    markdown,
    metadata: policy,
    controls
  };
}
