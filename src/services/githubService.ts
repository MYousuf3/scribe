import { Octokit } from '@octokit/rest';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    type: string;
  };
  private: boolean;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Verify if the user has access to a specific repository
   */
  async verifyRepositoryAccess(owner: string, repo: string): Promise<{
    hasAccess: boolean;
    permissions?: {
      admin: boolean;
      maintain: boolean;
      push: boolean;
      pull: boolean;
    };
    error?: string;
  }> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        hasAccess: true,
        permissions: {
          admin: data.permissions?.admin || false,
          maintain: data.permissions?.maintain || false,
          push: data.permissions?.push || false,
          pull: data.permissions?.pull || true, // Default to read access if permissions not available
        },
      };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          hasAccess: false,
          error: 'Repository not found or access denied',
        };
      }
      
      if (error.status === 403) {
        return {
          hasAccess: false,
          error: 'Access forbidden - insufficient permissions',
        };
      }

      return {
        hasAccess: false,
        error: `GitHub API error: ${error.message}`,
      };
    }
  }

  /**
   * Get user's GitHub profile information
   */
  async getUserProfile(): Promise<GitHubUser | null> {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return {
        id: data.id,
        login: data.login,
        name: data.name || undefined,
        email: data.email || undefined,
        avatar_url: data.avatar_url,
      };
    } catch (error) {
      console.error('Error fetching GitHub user profile:', error);
      return null;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        owner: {
          login: data.owner.login,
          id: data.owner.id,
          type: data.owner.type,
        },
        private: data.private,
        permissions: {
          admin: data.permissions?.admin || false,
          maintain: data.permissions?.maintain || false,
          push: data.permissions?.push || false,
          pull: data.permissions?.pull || true,
        },
      };
    } catch (error) {
      console.error('Error fetching repository information:', error);
      return null;
    }
  }

  /**
   * Check if user has write access to repository
   */
  async hasWriteAccess(owner: string, repo: string): Promise<boolean> {
    const access = await this.verifyRepositoryAccess(owner, repo);
    return access.hasAccess && (
      access.permissions?.admin || 
      access.permissions?.maintain || 
      access.permissions?.push || 
      false
    );
  }

  /**
   * Check if user is the owner of the repository
   */
  async isRepositoryOwner(owner: string, repo: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile();
      if (!userProfile) return false;

      const access = await this.verifyRepositoryAccess(owner, repo);
      if (!access.hasAccess) return false;

      // Check if user is the owner or has admin access
      return userProfile.login === owner || access.permissions?.admin || false;
    } catch (error) {
      console.error('Error checking repository ownership:', error);
      return false;
    }
  }

  /**
   * Extract owner and repo name from GitHub URL
   */
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/);
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2],
    };
  }

  /**
   * Rate limit information
   */
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data;
    } catch (error) {
      console.error('Error fetching rate limit:', error);
      return null;
    }
  }
}

/**
 * Helper function to create GitHub service instance from access token
 */
export function createGitHubService(accessToken: string): GitHubService {
  return new GitHubService(accessToken);
}

/**
 * Helper function to verify if a user can access a repository
 */
export async function verifyUserRepositoryAccess(
  accessToken: string,
  repositoryUrl: string
): Promise<{
  canAccess: boolean;
  isOwner: boolean;
  hasWriteAccess: boolean;
  error?: string;
}> {
  const parsedUrl = GitHubService.parseGitHubUrl(repositoryUrl);
  if (!parsedUrl) {
    return {
      canAccess: false,
      isOwner: false,
      hasWriteAccess: false,
      error: 'Invalid GitHub repository URL',
    };
  }

  const github = createGitHubService(accessToken);

  try {
    const [access, isOwner, hasWrite] = await Promise.all([
      github.verifyRepositoryAccess(parsedUrl.owner, parsedUrl.repo),
      github.isRepositoryOwner(parsedUrl.owner, parsedUrl.repo),
      github.hasWriteAccess(parsedUrl.owner, parsedUrl.repo),
    ]);

    return {
      canAccess: access.hasAccess,
      isOwner,
      hasWriteAccess: hasWrite,
      error: access.error,
    };
  } catch (error: any) {
    return {
      canAccess: false,
      isOwner: false,
      hasWriteAccess: false,
      error: `GitHub API error: ${error.message}`,
    };
  }
} 