import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Project } from '@/models';

/**
 * Projects API Route
 * 
 * Fetches all projects from the database, sorted by their last update time.
 * 
 * @returns List of all projects with their details
 */
export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Fetch all projects, sorted by updated_at descending (most recently updated first)
    const rawProjects = await Project.find({})
      .sort({ updated_at: -1 })
      .lean(); // Use lean() for better performance when we don't need Mongoose document features

    // Transform projects to ensure consistent ID field usage
    // Since .lean() doesn't apply schema transforms, we manually clean up the data
    const projects = rawProjects.map((project: any) => {
      // Ensure we have the custom id field, fallback to _id if needed
      const cleanProject = {
        ...project,
        id: project.id || project._id?.toString()
      };
      
      // Remove MongoDB fields for consistency
      if ('_id' in cleanProject) delete cleanProject._id;
      if ('__v' in cleanProject) delete cleanProject.__v;
      
      return cleanProject;
    });

    // Return success response with projects list
    return NextResponse.json(
      {
        success: true,
        projects,
        count: projects.length,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching projects:', error);

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
        message: 'An unexpected error occurred while fetching projects.',
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
      message: 'POST method is not supported for this endpoint. Use GET to fetch projects.',
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'PUT method is not supported for this endpoint. Use GET to fetch projects.',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'DELETE method is not supported for this endpoint. Use GET to fetch projects.',
    },
    { status: 405 }
  );
} 