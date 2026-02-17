// Framework & Control Type Definitions
// Single source of truth for GRC data structures

/**
 * Regulatory framework definition
 */
export interface Framework {
  id: string;           // "COBIT", "ISO27001", "NIST_CSF", "NIST_800_53", "FRA"
  name: string;         // Display name
  version: string;      // Framework version
  description: string;
  domains: Domain[];
}

/**
 * Framework domain/category
 */
export interface Domain {
  id: string;
  name: string;
  description: string;
  controls: string[];   // Control IDs in this domain
}

/**
 * Control definition (core GRC unit)
 */
export interface Control {
  id: string;           // Unique: "AC-001"
  code: string;         // Display: "AC.1"
  title: string;
  description: string;
  category: string;     // "Access Control", "Risk Management", etc.
  objective: string;    // What this control achieves
  evidenceRequired: string[];
  testingFrequency: "Annual" | "Quarterly" | "Monthly" | "Continuous";
  owner: string;        // Department responsible
  priority: "P0" | "P1" | "P2" | "P3";
  mappings: ControlMapping[];  // Cross-framework references
  relatedPolicies?: string[];  // Policy codes
}

/**
 * Cross-framework control mapping
 */
export interface ControlMapping {
  framework: string;    // Framework ID
  controlId: string;    // Control ID in that framework
  controlCode: string;  // Display code (e.g., "A.9.2.1")
  relationship: "implements" | "supports" | "related";
}

/**
 * Policy document definition
 */
export interface Policy {
  code: string;         // "POL-GOV-001"
  title: string;
  category: string;     // "Governance & Board", etc.
  scope: string;        // Who/what this applies to
  purpose: string;      // Why this policy exists
  statements: PolicyStatement[];
  requirements: string[];
  exceptions: string[];
  enforcement: string;
  mappedControls: string[];     // Control IDs
  frameworks: string[];         // Framework IDs
  owner: string;                // Department
  approver: string;             // Role
  effectiveDate: string;        // ISO date
  reviewDate: string;           // ISO date
  reviewFrequency: "Annual" | "Bi-annual" | "Quarterly";
  version: string;              // "1.0"
  status: "Draft" | "Review" | "Approved" | "Active" | "Archived";
}

/**
 * Individual policy statement
 */
export interface PolicyStatement {
  id: string;
  statement: string;
  controlIds: string[];  // Which controls this statement implements
}

/**
 * Policy generation request
 */
export interface PolicyGenerationRequest {
  category: string;
  title: string;
  purpose: string;
  department?: string;
  frameworks: string[];  // Framework IDs to comply with
}

/**
 * Policy generation result
 */
export interface PolicyGenerationResult {
  markdown: string;      // Rendered policy document
  metadata: Policy;      // Structured policy data
  controls: Control[];   // Relevant controls used
}

/**
 * Evidence requirement
 */
export interface Evidence {
  id: string;
  controlId: string;
  type: "Document" | "Log" | "Screenshot" | "Report" | "Certificate";
  description: string;
  frequency: string;
  retentionPeriod: string;
}

/**
 * Compliance status
 */
export interface ComplianceStatus {
  controlId: string;
  status: "Compliant" | "Partial" | "Non-Compliant" | "Not-Applicable";
  lastAssessed: string;  // ISO date
  evidence: string[];    // Evidence IDs
  gaps?: string[];
  remediationPlan?: string;
}
