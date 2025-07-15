import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { CommitData } from './gitService';

// Configuration for the LLM service
const MODEL_NAME = 'gemini-1.5-pro';
const GENERATION_TIMEOUT = 30000; // Increased to 30 seconds for better reliability

// Initialize the Google Generative AI client
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Initialize the Gemini AI client with API key from environment
 */
function initializeGemini(): void {
  if (genAI && model) {
    return; // Already initialized
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required for AI changelog generation');
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Create a concise prompt for changelog generation
 */
function createChangelogPrompt(commits: CommitData[]): string {
  const commitDetails = commits.map((commit, index) => 
    `${index + 1}. ${commit.message}`
  ).join('\n');
  
  return `Generate a technical changelog from these commit messages. Create ONE main title (# header) summarizing the release scope.

COMMITS (${commits.length} total):
${commitDetails}

FORMAT:
# [Release Title]

## Features
- [Feature implementation with technical details]

## Bug Fixes  
- [Bug resolution with root cause and solution]

## Improvements
- [Performance/architectural enhancements with metrics]

## Documentation
- [Technical documentation updates]

## Chores
- [Maintenance, dependencies, refactoring]

TECHNICAL REQUIREMENTS:
- Write for software engineers and technical stakeholders
- Include implementation details, architectural changes, and performance impacts
- Use precise technical terminology (APIs, algorithms, frameworks, patterns)
- Describe code changes, system modifications, and infrastructure updates
- Mention specific technologies, libraries, and methodologies when relevant
- Focus on technical impact: performance gains, security improvements, scalability
- Include version numbers, dependency updates, and configuration changes
- Explain technical debt reduction and architectural improvements
- Each description should be 8-12 words with technical depth
- Skip trivial commits (merge, typo, debug, WIP, version bumps)
- Use technical action verbs (implement, optimize, refactor, migrate, configure)

Generate comprehensive technical changelog:`;
}

/**
 * Generate a changelog summary from commit messages using Gemini AI
 * 
 * @param commits - Array of commit data to analyze
 * @returns Promise resolving to the generated changelog text
 */
export async function generateSummary(commits: CommitData[]): Promise<string> {
  try {
    // Validate input
    if (!commits || commits.length === 0) {
      return "No commits provided for changelog generation.";
    }
    
    // Initialize Gemini client
    initializeGemini();
    
    if (!model) {
      throw new Error('Failed to initialize Gemini AI model');
    }
    
    // Create the prompt
    const prompt = createChangelogPrompt(commits);
    
    // Create a promise that will timeout after the specified duration
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Gemini AI request timed out after ${GENERATION_TIMEOUT}ms`));
      }, GENERATION_TIMEOUT);
    });
    
    // Generate content with timeout
    const generationPromise = model.generateContent(prompt);
    
    const result = await Promise.race([generationPromise, timeoutPromise]);
    
    // Extract the generated text
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini AI returned empty response');
    }
    
    return text.trim();
    
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error(`AI changelog generation timed out after ${GENERATION_TIMEOUT / 1000} seconds`);
      } else if (error.message.includes('API_KEY')) {
        throw new Error('Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.');
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('Gemini AI quota exceeded or rate limited. Please try again later.');
      } else if (error.message.includes('safety')) {
        throw new Error('Content was blocked by Gemini AI safety filters. Please review your commit messages.');
      } else {
        throw new Error(`AI changelog generation failed: ${error.message}`);
      }
    }
    
    throw new Error(`Unexpected error during AI changelog generation: ${error}`);
  }
}

/**
 * Generate a changelog for recent commits from a repository
 * 
 * @param commits - Array of commit data
 * @param options - Optional configuration for summary generation
 * @returns Promise resolving to the generated changelog
 */
export async function generateChangelogFromCommits(
  commits: CommitData[],
  options?: {
    includeAuthorStats?: boolean;
    maxCommits?: number;
  }
): Promise<{
  changelog: string;
  commitsAnalyzed: number;
  generatedAt: string;
}> {
  const maxCommits = options?.maxCommits || 100;
  const commitsToAnalyze = commits.slice(0, maxCommits);
  
  const changelog = await generateSummary(commitsToAnalyze);
  
  let result = {
    changelog,
    commitsAnalyzed: commitsToAnalyze.length,
    generatedAt: new Date().toISOString()
  };
  
  // Add author statistics if requested
  if (options?.includeAuthorStats && commitsToAnalyze.length > 0) {
    const authorStats = commitsToAnalyze.reduce((stats, commit) => {
      const author = commit.author.name;
      stats[author] = (stats[author] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    const statsText = Object.entries(authorStats)
      .sort(([, a], [, b]) => b - a)
      .map(([author, count]) => `- ${author}: ${count} commit${count !== 1 ? 's' : ''}`)
      .join('\n');
    
    result.changelog += `\n\n## Contributors\n${statsText}`;
  }
  
  return result;
}

/**
 * Validate if the AI service is properly configured
 */
export function validateLLMConfiguration(): { isValid: boolean; error?: string } {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { isValid: false, error: 'GEMINI_API_KEY environment variable is not set' };
    }
    
    if (apiKey.length < 10) {
      return { isValid: false, error: 'GEMINI_API_KEY appears to be invalid (too short)' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Configuration validation failed: ${error}` };
  }
}

/**
 * Test the AI service with a simple prompt
 */
export async function testLLMService(): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const testCommits: CommitData[] = [
      {
        sha: 'abc123',
        message: 'Add user authentication feature',
        author: { name: 'Test User', email: 'test@example.com' },
        date: new Date().toISOString()
      },
      {
        sha: 'def456',
        message: 'Fix bug in payment processing',
        author: { name: 'Test User', email: 'test@example.com' },
        date: new Date().toISOString()
      }
    ];
    
    const result = await generateSummary(testCommits);
    return { success: true, response: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
} 