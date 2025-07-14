import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../../lib/mongodb';
import Project from '../../../../models/Project';
import Changelog from '../../../../models/Changelog';
import { requireAuthAndProjectOwnership } from '../../../../lib/auth-middleware';

// Request validation schema
const DeleteProjectRequest = z.object({
  project_id: z.string().uuid('Invalid project ID format - must be a valid UUID'),
});

/**
 * DELETE /api/developer/delete-project
 * Delete a project and all its changelogs with ownership verification
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { project_id } = DeleteProjectRequest.parse(body);

    // Verify authentication and project ownership
    const { auth, project } = await requireAuthAndProjectOwnership(request, project_id);

    // Connect to database
    await connectToDatabase();

    // First, delete all changelogs associated with this project
    const changelogDeleteResult = await Changelog.deleteMany({ project_id: project_id });
    console.log(`Deleted ${changelogDeleteResult.deletedCount} changelogs for project ${project_id}`);

    // Then delete the project
    const projectDeleteResult = await Project.deleteOne({ id: project_id });

    if (projectDeleteResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          message: 'The specified project could not be found or was already deleted',
        },
        { status: 404 }
      );
    }

    console.log(`Project deleted: ${project_id} (${project.name}) by user ${auth.user.username}`);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Project and all associated changelogs deleted successfully',
        project_id: project_id,
        project_name: project.name,
        changelogs_deleted: changelogDeleteResult.deletedCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete project error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          details: 'Please sign in with your GitHub account to delete projects'
        },
        { status: 401 }
      );
    }

    // Handle ownership errors
    if (error instanceof Error && error.message.includes('ownership required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          details: 'You can only delete projects that you own'
        },
        { status: 403 }
      );
    }

    // Handle database errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      if (errorMessage.includes('connection') || errorMessage.includes('database')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database error',
            details: 'Failed to delete project'
          },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: 'An unexpected error occurred while deleting the project'
      },
      { status: 500 }
    );
  }
} 