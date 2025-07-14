import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import { Changelog } from '@/models';

// Validation schema for the projectId parameter
const projectIdSchema = z.string().uuid('Invalid project ID format');

/**
 * Project Changelogs API Route
 * 
 * Fetches published changelogs for a specific project, with optional search functionality.
 * 
 * @param request - GET request with optional search query parameter
 * @param params - URL parameters containing projectId
 * @returns List of published changelogs for the project
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    // Extract and await params
    const params = await context.params;
    
    // Validate projectId parameter
    const projectIdValidation = projectIdSchema.safeParse(params.projectId);
    if (!projectIdValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid project ID',
          details: projectIdValidation.error.issues,
        },
        { status: 400 }
      );
    }

    const projectId = projectIdValidation.data;

    // Extract search term from query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    // Connect to MongoDB
    await connectToDatabase();

    // Build query filter
    const query: any = {
      project_id: projectId,
      status: 'published',
    };

    // Add search filter if provided (case-insensitive regex search in summary_final)
    if (searchTerm) {
      query.summary_final = {
        $regex: searchTerm,
        $options: 'i', // Case-insensitive
      };
    }

    // Fetch changelogs with filters, sorted by published_at descending
    const changelogs = await Changelog.find(query)
      .sort({ published_at: -1 })
      .lean(); // Use lean() for better performance

    // Return success response with changelogs list
    return NextResponse.json(
      {
        success: true,
        changelogs,
        count: changelogs.length,
        project_id: projectId,
        search_term: searchTerm || null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error fetching project changelogs:', error);

    // Handle specific MongoDB connection errors
    if (error instanceof Error && error.message.includes('connection')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please try again later.',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Handle general server errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching changelogs.',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'POST method is not supported for this endpoint. Use GET to fetch project changelogs.',
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'PUT method is not supported for this endpoint. Use GET to fetch project changelogs.',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'DELETE method is not supported for this endpoint. Use GET to fetch project changelogs.',
    },
    { status: 405 }
  );
} 