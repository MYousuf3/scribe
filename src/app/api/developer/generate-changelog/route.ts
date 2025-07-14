import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Project from '../../../../models/Project';
import Changelog from '../../../../models/Changelog';
import { fetchRecentCommitsByCount, CommitData } from '../../../../services/gitService';
import { generateSummary } from '../../../../services/llmService';
import { requireAuthAndRepositoryAccess } from '../../../../lib/auth-middleware';

// Request validation schema
const GenerateChangelogRequest = z.object({
  project_name: z.string().min(1).max(200).trim(),
  repo_url: z.string().url().refine(
    (url) => {
      // Validate GitHub URL format (matching Project model validation)
      const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
      return githubUrlRegex.test(url);
    },
    {
      message: 'Invalid GitHub repository URL format'
    }
  ),
  commit_count: z.number().int().min(1).max(100).optional().default(10)
});

// Response type
interface GenerateChangelogResponse {
  success: boolean;
  changelog_id: string;
  ai_summary: string;
  summary_final: string;
  version: string;
  project_id: string;
  commit_count: number;
}





/**
 * Generate a date-based version string
 */
function generateVersion(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day}-${hours}${minutes}`;
}

/**
 * POST /api/developer/generate-changelog
 * Generate AI changelog from GitHub repository (Requires Authentication)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { project_name, repo_url, commit_count } = GenerateChangelogRequest.parse(body);

    // Normalize repo URL (remove trailing slash)
    const normalizedRepoUrl = repo_url.replace(/\/$/, '');

    // Verify authentication and repository access
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { auth, repositoryAccess: _repositoryAccess } = await requireAuthAndRepositoryAccess(request, normalizedRepoUrl);

    // Connect to database
    await connectToDatabase();

    // Find or create user in database (sync with latest GitHub data)
    const githubProfile = await (async () => {
      // Extract GitHub profile from session
      return {
        id: auth.user.github_id,
        login: auth.user.username,
        name: auth.user.name,
        email: auth.user.email,
        avatar_url: auth.user.avatar_url,
      };
    })();

    const user = await (User as any).findOrCreateFromGitHub(githubProfile, auth.user.access_token);

    // Check if project already exists with this repo URL
    let project = await (Project as any).findByRepoUrl(normalizedRepoUrl);
    console.log(`🔍 Project lookup result:`, project ? {
      id: project.id,
      name: project.name,
      repo_url: project.repo_url,
      github_repo_owner: project.github_repo_owner,
      github_repo_name: project.github_repo_name,
      owner_id: project.owner_id
    } : 'No existing project found');
    
    if (project) {
      // Project exists - update owner if not set
      if (!project.owner_id) {
        project.owner_id = user.id;
      }
      
      // Update missing GitHub fields for existing projects (backward compatibility)
      if (!project.github_repo_owner || !project.github_repo_name) {
        const match = normalizedRepoUrl.match(/^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/);
        if (match) {
          project.github_repo_owner = match[1];
          project.github_repo_name = match[2];
          console.log(`Updated project GitHub fields: ${project.name} -> ${match[1]}/${match[2]}`);
        }
      }
      
      await project.save();
      console.log(`Project already exists: ${project.name} (${project.id})`);
    } else {
      // Extract GitHub owner and repo name from URL
      const match = normalizedRepoUrl.match(/^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/);
      if (!match) {
        return NextResponse.json(
          {
            error: 'Invalid GitHub repository URL format',
            details: 'URL must be in format: https://github.com/owner/repository'
          },
          { status: 400 }
        );
      }
      
      const github_repo_owner = match[1];
      const github_repo_name = match[2];
      
      // Create new project with owner and GitHub info
      project = new Project({
        name: project_name,
        repo_url: normalizedRepoUrl,
        owner_id: user.id,
        github_repo_owner,
        github_repo_name,
      });
      
      await project.save();
      console.log(`Created new project: ${project.name} (${project.id}) owned by ${user.username}`);
    }

    console.log(`Fetching ${commit_count} most recent commits`);

    // Fetch most recent commits from repository
    const commits = await fetchRecentCommitsByCount(normalizedRepoUrl, commit_count);
    
    if (commits.length === 0) {
      return NextResponse.json(
        { 
          error: 'No commits found in the repository',
          details: `No commits found in the repository. Please ensure the repository exists and is accessible.`
        },
        { status: 400 }
      );
    }

    console.log(`Found ${commits.length} commits for analysis`);

    // Generate AI summary with 15-second timeout (handled by the service)
    const summaryAi = await generateSummary(commits);

    // Generate version string
    const version = generateVersion();

    // Extract commit hashes
    const commitHashes = commits.map((commit: CommitData) => commit.sha);

    // Create new changelog as draft
    const changelog = new Changelog({
      project_id: project.id,
      created_by: user.id,
      version: version,
      summary_ai: summaryAi,
      commit_hashes: commitHashes,
      status: 'draft'
    });

    await changelog.save();

    console.log(`Created changelog: ${changelog.id} (v${version})`);

    // Update project timestamp
    await project.updateTimestamp();

    // Return successful response
    const response: GenerateChangelogResponse = {
      success: true,
      changelog_id: changelog.id,
      ai_summary: summaryAi,
      summary_final: summaryAi, // Provide both for frontend compatibility
      version: version,
      project_id: project.id,
      commit_count: commits.length
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Generate changelog error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
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
          error: 'Authentication required',
          details: 'Please sign in with your GitHub account to generate changelogs'
        },
        { status: 401 }
      );
    }

    // Handle repository access errors
    if (error instanceof Error && error.message.includes('Repository access required')) {
      return NextResponse.json(
        {
          error: 'Repository access denied',
          details: 'You need access to this GitHub repository to generate changelogs'
        },
        { status: 403 }
      );
    }

    // Handle MongoDB errors (check for specific error properties)
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      if (errorMessage.includes('duplicate key')) {
        return NextResponse.json(
          {
            error: 'Repository URL already exists',
            details: 'A project with this repository URL has already been registered'
          },
          { status: 409 }
        );
      }

      if (errorMessage.includes('connection') || errorMessage.includes('database')) {
        return NextResponse.json(
          {
            error: 'Database error',
            details: 'Failed to save project or changelog data'
          },
          { status: 500 }
        );
      }
    }

    // Handle service-specific errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Git service errors
      if (errorMessage.includes('github') || errorMessage.includes('repository not found')) {
        return NextResponse.json(
          {
            error: 'Repository access error',
            details: error.message
          },
          { status: 404 }
        );
      }

      // Authentication errors
      if (errorMessage.includes('authentication') || errorMessage.includes('api key') || errorMessage.includes('token')) {
        return NextResponse.json(
          {
            error: 'Authentication error',
            details: 'Invalid or missing API credentials'
          },
          { status: 401 }
        );
      }

      // Timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return NextResponse.json(
          {
            error: 'Request timeout',
            details: 'AI changelog generation timed out. Please try again.'
          },
          { status: 408 }
        );
      }

      // Rate limit errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: 'API rate limit exceeded. Please try again later.'
          },
          { status: 429 }
        );
      }

      // Generic error with details
      return NextResponse.json(
        {
          error: 'Changelog generation failed',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred during changelog generation'
      },
      { status: 500 }
    );
  }
} 