// Framework Data Loader Utilities
// Single source for loading and querying framework/control data

import { Control, Framework, ControlMapping } from '@/lib/types';
import controlsSample from '@/data/frameworks/controls-sample.json';

/**
 * Load all controls
 */
export function loadAllControls(): Control[] {
  return controlsSample.controls as Control[];
}

/**
 * Load controls by framework
 */
export function loadControlsByFramework(frameworkId: string): Control[] {
  const allControls = loadAllControls();
  return allControls.filter(control =>
    control.mappings.some(m => m.framework === frameworkId)
  );
}

/**
 * Load controls by category
 */
export function loadControlsByCategory(category: string): Control[] {
  const allControls = loadAllControls();
  return allControls.filter(control => control.category === category);
}

/**
 * Load controls by frameworks AND category (intersection)
 */
export function loadControlsByFrameworksAndCategory(
  frameworks: string[],
  category: string
): Control[] {
  const allControls = loadAllControls();
  
  return allControls.filter(control => {
    // Must match category
    if (control.category !== category) return false;
    
    // Must map to at least one of the requested frameworks
    return frameworks.some(fw =>
      control.mappings.some(m => m.framework === fw)
    );
  });
}

/**
 * Get control by ID
 */
export function getControlById(id: string): Control | undefined {
  const allControls = loadAllControls();
  return allControls.find(c => c.id === id);
}

/**
 * Get framework mapping for a control
 */
export function getFrameworkMapping(
  controlId: string,
  frameworkId: string
): ControlMapping | undefined {
  const control = getControlById(controlId);
  if (!control) return undefined;
  
  return control.mappings.find(m => m.framework === frameworkId);
}

/**
 * Get all controls that map to a specific framework control
 */
export function getControlsByFrameworkControl(
  frameworkId: string,
  frameworkControlId: string
): Control[] {
  const allControls = loadAllControls();
  
  return allControls.filter(control =>
    control.mappings.some(
      m => m.framework === frameworkId && m.controlId === frameworkControlId
    )
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats() {
  const allControls = loadAllControls();
  const categories = new Map<string, number>();
  
  allControls.forEach(control => {
    const count = categories.get(control.category) || 0;
    categories.set(control.category, count + 1);
  });
  
  return Array.from(categories.entries()).map(([category, count]) => ({
    category,
    count
  }));
}

/**
 * Get framework coverage statistics
 */
export function getFrameworkStats() {
  const allControls = loadAllControls();
  const frameworks = new Map<string, number>();
  
  allControls.forEach(control => {
    control.mappings.forEach(mapping => {
      const count = frameworks.get(mapping.framework) || 0;
      frameworks.set(mapping.framework, count + 1);
    });
  });
  
  return Array.from(frameworks.entries()).map(([framework, count]) => ({
    framework,
    count
  }));
}

/**
 * Supported framework IDs
 */
export const SUPPORTED_FRAMEWORKS = [
  'COBIT',
  'ISO27001',
  'NIST_CSF',
  'NIST_800_53',
  'FRA'
] as const;

/**
 * Category mapping
 */
export const CATEGORIES = [
  'Governance & Board',
  'Risk Management',
  'Compliance & Regulatory',
  'Information Security',
  'IT Governance',
  'Human Resources',
  'Operations',
  'Finance',
  'Internal Audit',
  'Administration'
] as const;
