import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import { Changelog, Project } from '@/models';

// Validation schema for the request body
const publishChangelogSchema = z.object({
  changelog_id: z.string().uuid('Invalid changelog ID format - must be a valid UUID'),
  summary_final: z.string().min(1, 'Final summary cannot be empty').max(10000, 'Summary too long'),
});

/**
 * Publish Changelog API Route
 * 
 * Publishes a draft changelog by updating its status and summary,
 * and updates the associated project's timestamp.
 * 
 * @param request - POST request with changelog_id and summary_final
 * @returns Success response with published changelog details
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Parse and validate request body
    const body = await request.json();
    const validation = publishChangelogSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }
    
    const { changelog_id, summary_final } = validation.data;
    
    // Find the changelog document by ID
    const changelog = await Changelog.findOne({ id: changelog_id });
    
    if (!changelog) {
      return NextResponse.json(
        {
          success: false,
          error: 'Changelog not found',
          message: 'The specified changelog ID does not exist',
        },
        { status: 404 }
      );
    }
    
    // Check if changelog is already published
    if (changelog.status === 'published') {
      return NextResponse.json(
        {
          success: false,
          error: 'Already published',
          message: 'This changelog has already been published',
        },
        { status: 409 }
      );
    }
    
    // Get current timestamp for published_at
    const currentDate = new Date();
    
    // Update the changelog document
    const updatedChangelog = await Changelog.findOneAndUpdate(
      { id: changelog_id },
      {
        summary_final,
        published_at: currentDate,
        status: 'published',
        updated_at: currentDate,
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedChangelog) {
      return NextResponse.json(
        {
          success: false,
          error: 'Update failed',
          message: 'Failed to update changelog',
        },
        { status: 500 }
      );
    }
    
    // Update the associated project's updated_at field
    const projectUpdateResult = await Project.findOneAndUpdate(
      { id: updatedChangelog.project_id },
      { updated_at: currentDate },
      { new: true }
    );
    
    if (!projectUpdateResult) {
      console.warn(`Failed to update project timestamp for project_id: ${updatedChangelog.project_id}`);
      // Don't fail the request since the main operation succeeded
    }
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Changelog published successfully',
        changelog: {
          id: updatedChangelog.id,
          version: updatedChangelog.version,
          status: updatedChangelog.status,
          published_at: updatedChangelog.published_at,
          project_id: updatedChangelog.project_id,
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in publish-changelog API:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }
    
    // Handle MongoDB connection errors
    if (error instanceof Error && error.message.includes('connection')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: 'Unable to connect to database',
        },
        { status: 503 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while publishing the changelog',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed', 
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests', 
    },
    { status: 405 }
  );
} 