import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, description, frameworks, department } = body;

    // Validate required fields
    if (!category || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: category, title, description' },
        { status: 400 }
      );
    }

    // Generate policy content using AI (placeholder for now)
    const generatedPolicy = generatePolicyContent({
      category,
      title,
      description,
      frameworks: frameworks || [],
      department: department || ''
    });

    return NextResponse.json({
      success: true,
      policy: generatedPolicy
    });

  } catch (error) {
    console.error('Error generating policy:', error);
    return NextResponse.json(
      { error: 'Failed to generate policy' },
      { status: 500 }
    );
  }
}

// AI Policy Generation Logic (Placeholder - can be connected to OpenAI/Claude/LM Studio)
function generatePolicyContent(params: {
  category: string;
  title: string;
  description: string;
  frameworks: string[];
  department: string;
}): string {
  const { category, title, description, frameworks, department } = params;

  // Framework-specific requirements
  const frameworkRequirements = frameworks.map(fw => {
    switch (fw) {
      case 'FRA':
        return '### FRA Compliance Requirements\n- Regulatory reporting obligations\n- Consumer protection standards\n- Data privacy and confidentiality\n';
      case 'COBIT':
        return '### COBIT 2019 Alignment\n- Governance processes\n- Management objectives\n- Performance measurement\n';
      case 'NIST 800-53':
        return '### NIST 800-53 Controls\n- Access control mechanisms\n- Audit and accountability\n- System protection measures\n';
      case 'NIST CSF':
        return '### NIST Cybersecurity Framework\n- Identify: Asset management, risk assessment\n- Protect: Access control, awareness training\n-Detect: Continuous monitoring\n- Respond: Incident response procedures\n- Recover: Recovery planning\n';
      case 'ISO 27001':
        return '### ISO 27001:2022 Requirements\n- Information security management system\n- Risk treatment\n- Security controls from Annex A\n';
      default:
        return `### ${fw} Requirements\n- Compliance obligations\n- Control implementation\n';
    }
  }).join('\n');

  // Generate policy markdown
  return `# ${title}

**Policy Code:** POL-${getCategoryCode(category)}-XXX  
**Category:** ${category}  
**Owner:** ${department || '[Department Name]'}  
**Effective Date:** ${new Date().toISOString().split('T')[0]}  
**Review Date:** ${getReviewDate()}  
**Approved By:** [Approval Authority]

---

## 1. Purpose

${description}

This policy establishes the framework, requirements, and responsibilities for ${title.toLowerCase()} to ensure:
- Compliance with regulatory requirements
- Protection of organizational assets
- Alignment with industry best practices
- Effective risk management

---

## 2. Scope

This policy applies to:
- All employees and contractors
- ${department ? `Specifically: ${department} Department` : 'All departments'}
- Third-party service providers
- Business partners

---

## 3. Policy Statement

The organization is committed to ${description.toLowerCase()}.

All stakeholders must:
- Comply with applicable laws and regulations
- Follow established procedures and controls
- Report violations or concerns immediately
- Participate in required training

---

## 4. Regulatory and Framework Compliance

${frameworkRequirements || '### Applicable Frameworks\n- Industry best practices\n- Regulatory requirements\n'}

---

## 5. Roles and Responsibilities

### Senior Management
- Approve and endorse this policy
- Allocate necessary resources
- Review policy effectiveness

### ${department || '[Department]'} Head
- Implement policy requirements
- Monitor compliance
- Report exceptions

### All Employees
- Understand and comply with policy
- Complete required training
- Report violations

---

## 6. Policy Requirements

### 6.1 General Requirements
- [Specific requirement 1 - customize based on category]
- [Specific requirement 2]
- [Specific requirement 3]

### 6.2 Controls and Safeguards
- Implement appropriate controls
- Regular monitoring and review
- Documentation of compliance

### 6.3 Training and Awareness
- Annual policy training (mandatory)
- Role-specific training as needed
- Regular awareness communications

---

## 7. Monitoring and Compliance

**Compliance Measures:**
- Regular audits and assessments
- Key performance indicators tracking
- Exception reporting

**Review Frequency:** ${getReviewFrequency(category)}

---

## 8. Non-Compliance

Violations of this policy may result in:
- Disciplinary action (up to termination)
- Legal consequences
- Regulatory sanctions
- Reputational damage

---

## 9. Exceptions

Exceptions to this policy must be:
- Documented in writing
- Approved by [Approval Authority]
- Reviewed periodically
- Time-limited

---

## 10. Related Documents

- [Related Policy 1]
- [Related Procedure 1]
- [Framework Standards]
- [Regulatory Guidelines]

---

## 11. Revision History

| Version | Date | Author | Approver | Changes |
|---------|------|--------|----------|---------|
| 1.0 | ${new Date().toISOString().split('T')[0]} | AI Generator | [Name] | Initial draft |

---

## 12. Approval

**Prepared by:** [Name, Title]  
**Reviewed by:** [Name, Title]  
**Approved by:** [Name, Title]

---

*This policy was AI-generated based on the provided parameters. Please review and customize as needed before submission for approval.*
`;
}

function getCategoryCode(category: string): string {
  const codes: { [key: string]: string } = {
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
  return codes[category] || 'GEN';
}

function getReviewDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

function getReviewFrequency(category: string): string {
  const critical = ['Governance & Board', 'Risk Management', 'Compliance & Regulatory', 'Information Security'];
  return critical.includes(category) ? 'Annual' : 'Bi-annual';
}
