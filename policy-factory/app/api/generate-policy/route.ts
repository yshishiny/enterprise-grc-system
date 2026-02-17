import { NextRequest, NextResponse } from 'next/server';
import { buildPolicy } from '@/lib/generator/policy-builder';
import type { PolicyGenerationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, description, frameworks, department } = body;

    // Validate required fields
    if (!category || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: category, title, description' },
        { status: 400 }
      );
    }

    // Build policy request
    const policyRequest: PolicyGenerationRequest = {
      category,
      title,
      purpose: description,
      department: department || 'TBD',
      frameworks: frameworks || []
    };

    // Generate policy from structured data
    const result = await buildPolicy(policyRequest);

    return NextResponse.json({
      success: true,
      policy: result.markdown,
      metadata: result.metadata,
      controls: result.controls
    });

  } catch (error: any) {
    console.error('Error generating policy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate policy' },
      { status: 500 }
    );
  }
}
