import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../../lib/mongodb';
import Changelog from '../../../../models/Changelog';
import { requireAuthAndChangelogOwnership } from '../../../../lib/auth-middleware';

// Request validation schema
const DeleteChangelogRequest = z.object({
  changelog_id: z.string().uuid('Invalid changelog ID format - must be a valid UUID'),
});

/**
 * DELETE /api/developer/delete-changelog
 * Delete a changelog with ownership verification
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { changelog_id } = DeleteChangelogRequest.parse(body);

    // Verify authentication and changelog ownership
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { auth, changelog: _changelog } = await requireAuthAndChangelogOwnership(request, changelog_id);

    // Connect to database
    await connectToDatabase();

    // Delete the changelog
    const deleteResult = await Changelog.deleteOne({ id: changelog_id });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Changelog not found',
          message: 'The specified changelog could not be found or was already deleted',
        },
        { status: 404 }
      );
    }

    console.log(`Changelog deleted: ${changelog_id} by user ${auth.user.username}`);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Changelog deleted successfully',
        changelog_id: changelog_id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete changelog error:', error);

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
          details: 'Please sign in with your GitHub account to delete changelogs'
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
          details: 'You can only delete changelogs that you created'
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
            details: 'Failed to delete changelog'
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
        details: 'An unexpected error occurred while deleting the changelog'
      },
      { status: 500 }
    );
  }
} 