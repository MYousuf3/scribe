import axios, { AxiosResponse } from 'axios';

// Types for our standardized commit format
export interface CommitData {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  date: string; // ISO string
}

// GitHub API response types
interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

// GitLab API response types
interface GitLabCommit {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  created_at: string;
}

// Repository info extracted from URL
interface RepoInfo {
  provider: 'github' | 'gitlab';
  owner: string;
  repo: string;
  host?: string; // For GitLab self-hosted instances
}

/**
 * Parse repository URL to extract provider, owner, and repo name
 */
function parseRepoUrl(repoUrl: string): RepoInfo {
  // Remove .git suffix if present
  const cleanUrl = repoUrl.replace(/\.git$/, '');
  
  // GitHub patterns
  const githubHttpsMatch = cleanUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
  const githubSshMatch = cleanUrl.match(/git@github\.com:([^\/]+)\/([^\/]+)/);
  
  if (githubHttpsMatch || githubSshMatch) {
    const match = githubHttpsMatch || githubSshMatch;
    return {
      provider: 'github',
      owner: match![1],
      repo: match![2]
    };
  }
  
  // GitLab patterns (gitlab.com and self-hosted)
  const gitlabHttpsMatch = cleanUrl.match(/https:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  const gitlabSshMatch = cleanUrl.match(/git@([^:]+):([^\/]+)\/([^\/]+)/);
  
  if (gitlabHttpsMatch || gitlabSshMatch) {
    const match = gitlabHttpsMatch || gitlabSshMatch;
    const host = match![1];
    
    // Check if it's GitLab (either gitlab.com or contains 'gitlab' in hostname)
    if (host === 'gitlab.com' || host.includes('gitlab')) {
      return {
        provider: 'gitlab',
        owner: match![2],
        repo: match![3],
        host: host
      };
    }
  }
  
  throw new Error(`Unsupported repository URL format: ${repoUrl}`);
}

/**
 * Fetch commits from GitHub repository using GitHub API
 */
async function _fetchGitHubCommits(
  owner: string,
  repo: string,
  sinceDate: Date,
  untilDate: Date
): Promise<CommitData[]> {
  const commits: CommitData[] = [];
  const baseUrl = 'https://api.github.com';
  let page = 1;
  const perPage = 100; // GitHub's max per page
  
  // Get GitHub PAT from environment
  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    throw new Error('GITHUB_PAT environment variable is required for GitHub API access');
  }
  
  const headers = {
    'Authorization': `Bearer ${githubPat}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Scribe-Changelog-Generator'
  };
  
  try {
    while (true) {
      const response: AxiosResponse<GitHubCommit[]> = await axios.get(
        `${baseUrl}/repos/${owner}/${repo}/commits`,
        {
          headers,
          params: {
            since: sinceDate.toISOString(),
            until: untilDate.toISOString(),
            page,
            per_page: perPage
          }
        }
      );
      
      const pageCommits = response.data;
      
      // Break if no more commits
      if (pageCommits.length === 0) {
        break;
      }
      
      // Transform GitHub commits to our standard format
      pageCommits.forEach(commit => {
        const commitDate = new Date(commit.commit.author.date);
        
        // Double-check date is in range (API should handle this, but extra safety)
        if (commitDate >= sinceDate && commitDate <= untilDate) {
          commits.push({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
              name: commit.commit.author.name,
              email: commit.commit.author.email
            },
            date: commit.commit.author.date
          });
        }
      });
      
      // If we got less than a full page, we're done
      if (pageCommits.length < perPage) {
        break;
      }
      
      page++;
    }
    
    return commits;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        throw new Error(`GitHub repository not found: ${owner}/${repo}`);
      } else if (status === 401 || status === 403) {
        throw new Error(`GitHub API authentication failed. Check your GITHUB_PAT token.`);
      } else if (status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
        throw new Error(`GitHub API rate limit exceeded. Please try again later.`);
      } else {
        throw new Error(`GitHub API error (${status}): ${message}`);
      }
    }
    
    throw new Error(`Failed to fetch GitHub commits: ${error}`);
  }
}

/**
 * Fetch commits from GitLab repository using GitLab API
 */
async function _fetchGitLabCommits(
  owner: string,
  repo: string,
  sinceDate: Date,
  untilDate: Date,
  host: string = 'gitlab.com'
): Promise<CommitData[]> {
  const commits: CommitData[] = [];
  const baseUrl = `https://${host}/api/v4`;
  let page = 1;
  const perPage = 100; // GitLab's max per page
  
  // Get GitLab PAT from environment
  const gitlabPat = process.env.GITLAB_PAT;
  if (!gitlabPat) {
    throw new Error('GITLAB_PAT environment variable is required for GitLab API access');
  }
  
  const headers = {
    'Authorization': `Bearer ${gitlabPat}`,
    'User-Agent': 'Scribe-Changelog-Generator'
  };
  
  // GitLab uses project ID or URL-encoded path
  const projectPath = encodeURIComponent(`${owner}/${repo}`);
  
  try {
    while (true) {
      const response: AxiosResponse<GitLabCommit[]> = await axios.get(
        `${baseUrl}/projects/${projectPath}/repository/commits`,
        {
          headers,
          params: {
            since: sinceDate.toISOString(),
            until: untilDate.toISOString(),
            page,
            per_page: perPage
          }
        }
      );
      
      const pageCommits = response.data;
      
      // Break if no more commits
      if (pageCommits.length === 0) {
        break;
      }
      
      // Transform GitLab commits to our standard format
      pageCommits.forEach(commit => {
        const commitDate = new Date(commit.created_at);
        
        // Double-check date is in range (API should handle this, but extra safety)
        if (commitDate >= sinceDate && commitDate <= untilDate) {
          commits.push({
            sha: commit.id,
            message: commit.message,
            author: {
              name: commit.author_name,
              email: commit.author_email
            },
            date: commit.created_at
          });
        }
      });
      
      // If we got less than a full page, we're done
      if (pageCommits.length < perPage) {
        break;
      }
      
      page++;
    }
    
    return commits;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        throw new Error(`GitLab repository not found: ${owner}/${repo} on ${host}`);
      } else if (status === 401 || status === 403) {
        throw new Error(`GitLab API authentication failed. Check your GITLAB_PAT token.`);
      } else if (status === 429) {
        throw new Error(`GitLab API rate limit exceeded. Please try again later.`);
      } else {
        throw new Error(`GitLab API error (${status}): ${message}`);
      }
    }
    
    throw new Error(`Failed to fetch GitLab commits: ${error}`);
  }
}

/**
 * Fetch commits from a repository (GitHub or GitLab)
 * 
 * @param repoUrl - Repository URL (HTTPS or SSH format)
 * @param sinceDate - Start date for commit range
 * @param untilDate - End date for commit range
 * @returns Array of standardized commit data
 */
export async function fetchCommitsFromRepo(
  repoUrl: string,
  sinceDate: Date,
  untilDate: Date
): Promise<CommitData[]> {
  try {
    // Parse the repository URL to determine provider and extract repo info
    const repoInfo = parseRepoUrl(repoUrl);
    
    // Validate date range
    if (sinceDate >= untilDate) {
      throw new Error('sinceDate must be before untilDate');
    }
    
    // Fetch commits based on provider
    switch (repoInfo.provider) {
      case 'github':
        return await _fetchGitHubCommits(
          repoInfo.owner,
          repoInfo.repo,
          sinceDate,
          untilDate
        );
        
      case 'gitlab':
        return await _fetchGitLabCommits(
          repoInfo.owner,
          repoInfo.repo,
          sinceDate,
          untilDate,
          repoInfo.host
        );
        
      default:
        throw new Error(`Unsupported repository provider: ${repoInfo.provider}`);
    }
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      throw new Error(`Failed to fetch commits from ${repoUrl}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to get commits for the last N days
 */
export async function fetchRecentCommits(
  repoUrl: string,
  daysBack: number = 30
): Promise<CommitData[]> {
  const untilDate = new Date();
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);
  
  return fetchCommitsFromRepo(repoUrl, sinceDate, untilDate);
}

/**
 * Validate if a repository URL is supported
 */
export function isValidRepoUrl(repoUrl: string): boolean {
  try {
    parseRepoUrl(repoUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get repository provider from URL
 */
export function getRepoProvider(repoUrl: string): 'github' | 'gitlab' | null {
  try {
    const repoInfo = parseRepoUrl(repoUrl);
    return repoInfo.provider;
  } catch {
    return null;
  }
} 