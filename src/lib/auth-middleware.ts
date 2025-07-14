import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import User from '../models/User';
import Project from '../models/Project';
import Changelog from '../models/Changelog';
import { verifyUserRepositoryAccess } from '../services/githubService';
import connectToDatabase from './mongodb';

export interface AuthenticatedUser {
  id: string;
  github_id: number;
  username: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  access_token: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  isAuthenticated: true;
}

export interface UnauthenticatedContext {
  user: null;
  isAuthenticated: false;
}

export type AuthResult = AuthContext | UnauthenticatedContext;

/**
 * Get authentication context from request
 */
export async function getAuthContext(req: NextRequest): Promise<AuthResult> {
  try {
    console.log('🔍 Auth Debug: Getting session from request');
    console.log('🔍 Auth Debug: Request URL:', req.url);
    console.log('🔍 Auth Debug: Request headers cookies:', req.headers.get('cookie'));
    
    // Try the simpler approach first - just call getServerSession without context
    // This should work in most cases for Next.js App Router
    let session = await getServerSession(authOptions) as any;
    
    console.log('🔍 Auth Debug: Initial session result:', JSON.stringify(session, null, 2));
    
    // If that fails, try with manual cookie parsing
    if (!session) {
      console.log('🔍 Auth Debug: No session found, trying manual cookie approach');
      const cookieHeader = req.headers.get('cookie');
      console.log('🔍 Auth Debug: Cookie header:', cookieHeader);
      
      if (cookieHeader) {
        // Try to create a more compatible request object
        const mockRequest = {
          headers: {
            cookie: cookieHeader,
            ...Object.fromEntries(req.headers.entries())
          },
          cookies: cookieHeader,
        };
        
        const mockResponse = {
          headers: new Headers(),
          setHeader: () => {},
          getHeader: () => undefined,
        };
        
        session = await getServerSession({
          req: mockRequest as any,
          res: mockResponse as any,
          ...authOptions
        }) as any;
        
        console.log('🔍 Auth Debug: Session with mock context:', JSON.stringify(session, null, 2));
      }
    }
    
    console.log('🔍 Auth Debug: Session result:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.githubId || !session.accessToken) {
      console.log('🔍 Auth Debug: No session or missing required fields');
      console.log('🔍 Auth Debug: Has user?', !!session?.user);
      console.log('🔍 Auth Debug: Has githubId?', !!session?.user?.githubId);
      console.log('🔍 Auth Debug: Has accessToken?', !!session?.accessToken);
      return { user: null, isAuthenticated: false };
    }

    await connectToDatabase();
    
    // Find user in database
    const user = await User.findOne({ github_id: session.user.githubId });
    if (!user) {
      console.log('🔍 Auth Debug: User not found in database for githubId:', session.user.githubId);
      return { user: null, isAuthenticated: false };
    }

    console.log('🔍 Auth Debug: Authentication successful for user:', user.username);
    return {
      user: {
        id: user.id,
        github_id: user.github_id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        access_token: user.access_token,
      },
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('🔍 Auth Debug: Error getting auth context:', error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const auth = await getAuthContext(req);
  
  if (!auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return auth;
}

/**
 * Check if user owns a project
 */
export async function checkProjectOwnership(
  projectId: string,
  userId: string
): Promise<{
  isOwner: boolean;
  project?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const project = await Project.findOne({
      $or: [
        { id: projectId },
        { _id: projectId }
      ]
    });

    if (!project) {
      return {
        isOwner: false,
        error: 'Project not found',
      };
    }

    // Check if user is the owner
    const isOwner = project.owner_id === userId;

    return {
      isOwner,
      project,
    };
  } catch (error) {
    console.error('Error checking project ownership:', error);
    return {
      isOwner: false,
      error: 'Failed to verify project ownership',
    };
  }
}

/**
 * Check if user owns a changelog
 */
export async function checkChangelogOwnership(
  changelogId: string,
  userId: string
): Promise<{
  isOwner: boolean;
  changelog?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const changelog = await Changelog.findOne({
      $or: [
        { id: changelogId },
        { _id: changelogId }
      ]
    });

    if (!changelog) {
      return {
        isOwner: false,
        error: 'Changelog not found',
      };
    }

    // Check if user is the creator
    const isOwner = changelog.created_by === userId;

    return {
      isOwner,
      changelog,
    };
  } catch (error) {
    console.error('Error checking changelog ownership:', error);
    return {
      isOwner: false,
      error: 'Failed to verify changelog ownership',
    };
  }
}

/**
 * Check if user can access a repository
 */
export async function checkRepositoryAccess(
  repositoryUrl: string,
  accessToken: string
): Promise<{
  canAccess: boolean;
  isOwner: boolean;
  hasWriteAccess: boolean;
  error?: string;
}> {
  try {
    return await verifyUserRepositoryAccess(accessToken, repositoryUrl);
  } catch (error: any) {
    console.error('Error checking repository access:', error);
    return {
      canAccess: false,
      isOwner: false,
      hasWriteAccess: false,
      error: `Repository access check failed: ${error.message}`,
    };
  }
}

/**
 * Require project ownership - throws error if user doesn't own project
 */
export async function requireProjectOwnership(
  projectId: string,
  userId: string
): Promise<any> {
  const ownership = await checkProjectOwnership(projectId, userId);
  
  if (!ownership.isOwner) {
    throw new Error(ownership.error || 'Access denied: Project ownership required');
  }
  
  return ownership.project;
}

/**
 * Require changelog ownership - throws error if user doesn't own changelog
 */
export async function requireChangelogOwnership(
  changelogId: string,
  userId: string
): Promise<any> {
  const ownership = await checkChangelogOwnership(changelogId, userId);
  
  if (!ownership.isOwner) {
    throw new Error(ownership.error || 'Access denied: Changelog ownership required');
  }
  
  return ownership.changelog;
}

/**
 * Require repository access - throws error if user can't access repository
 */
export async function requireRepositoryAccess(
  repositoryUrl: string,
  accessToken: string
): Promise<void> {
  const access = await checkRepositoryAccess(repositoryUrl, accessToken);
  
  if (!access.canAccess) {
    throw new Error(access.error || 'Access denied: Repository access required');
  }
}

/**
 * Combined auth and ownership check for projects
 */
export async function requireAuthAndProjectOwnership(
  req: NextRequest,
  projectId: string
): Promise<{
  auth: AuthContext;
  project: any;
}> {
  const auth = await requireAuth(req);
  const project = await requireProjectOwnership(projectId, auth.user.id);
  
  return { auth, project };
}

/**
 * Combined auth and ownership check for changelogs
 */
export async function requireAuthAndChangelogOwnership(
  req: NextRequest,
  changelogId: string
): Promise<{
  auth: AuthContext;
  changelog: any;
}> {
  const auth = await requireAuth(req);
  const changelog = await requireChangelogOwnership(changelogId, auth.user.id);
  
  return { auth, changelog };
}

/**
 * Combined auth and repository access check
 */
export async function requireAuthAndRepositoryAccess(
  req: NextRequest,
  repositoryUrl: string
): Promise<{
  auth: AuthContext;
  repositoryAccess: {
    canAccess: boolean;
    isOwner: boolean;
    hasWriteAccess: boolean;
  };
}> {
  const auth = await requireAuth(req);
  const repositoryAccess = await checkRepositoryAccess(repositoryUrl, auth.user.access_token);
  
  if (!repositoryAccess.canAccess) {
    throw new Error(repositoryAccess.error || 'Repository access required');
  }
  
  return { auth, repositoryAccess };
} 