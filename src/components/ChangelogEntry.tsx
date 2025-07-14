'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatChangelogDate } from '../lib/dateUtils';
import axios from '@/lib/axios';

interface Changelog {
  _id: string;
  id: string;
  project_id: string;
  created_by?: string;
  summary_final: string;
  status: string;
  published_at: Date;
  generated_at: Date;
  commit_hashes: string[];
  version: string;
  from_commit?: string;
  to_commit?: string;
  created_at: Date;
  content: string;
}

interface Project {
  _id: string;
  id: string;
  name: string;
  description?: string;
  repository_url: string;
  github_repo_owner?: string;
  github_repo_name?: string;
  created_at: Date;
  updated_at: Date;
}

interface ChangelogEntryProps {
  changelog: Changelog;
  project?: Project;
  onDelete?: (changelogId: string) => void;
}

export default function ChangelogEntry({ changelog, project, onDelete }: ChangelogEntryProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatCommitCount = (commitHashes: string[]) => {
    const count = commitHashes.length;
    return `${count} commit${count !== 1 ? 's' : ''}`;
  };

  // Check if current user owns the GitHub repository that this changelog belongs to
  const isOwner = session && project && project.github_repo_owner && 
    (session.user as any)?.username && 
    (session.user as any).username === project.github_repo_owner;

  const handleDelete = async () => {
    if (!isOwner) return;
    
    setIsDeleting(true);
    try {
      await axios.delete('/api/developer/delete-changelog', {
        data: { changelog_id: changelog.id }
      });
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(changelog.id);
      }
    } catch (error) {
      console.error('Error deleting changelog:', error);
      alert('Failed to delete changelog. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Simple markdown-like rendering for bullet points
  const renderMarkdownContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        
        // Handle bullet points (- or * at start of line)
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const bulletContent = trimmedLine.substring(2).trim();
          return (
            <li key={index} className="text-primary_green leading-relaxed mb-1">
              {bulletContent}
            </li>
          );
        }
        
        // Handle numbered lists (1. 2. etc.)
        if (/^\d+\.\s/.test(trimmedLine)) {
          const listContent = trimmedLine.replace(/^\d+\.\s/, '').trim();
          return (
            <li key={index} className="text-primary_green leading-relaxed mb-1 list-decimal">
              {listContent}
            </li>
          );
        }
        
        // Handle headers (## or ###)
        if (trimmedLine.startsWith('## ')) {
          const headerContent = trimmedLine.substring(3).trim();
          return (
            <h3 key={index} className="text-lg font-bold text-primary_green mt-4 mb-2 font-cuneiform">
              {headerContent}
            </h3>
          );
        }
        
        if (trimmedLine.startsWith('### ')) {
          const headerContent = trimmedLine.substring(4).trim();
          return (
            <h4 key={index} className="text-base font-semibold text-primary_green mt-3 mb-1 font-cuneiform">
              {headerContent}
            </h4>
          );
        }
        
        // Regular paragraph
        if (trimmedLine) {
          return (
            <p key={index} className="text-primary_green leading-relaxed mb-2">
              {trimmedLine}
            </p>
          );
        }
        
        // Empty line
        return <br key={index} />;
      });
  };

  return (
    <div className="bg-cream border-2 border-clay_brown font-cuneiform rounded-lg p-6 mb-6">
      {/* Cuneiform Inscription Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-clay_brown">
        <div className="flex items-center space-x-4">
          {/* Ancient symbols */}
          <div className="text-2xl text-golden_brown">𒀭</div>
          {/* Version and Commit Range */}
          <div className="flex flex-col space-y-1">
            {changelog.version && (
              <div className="text-sm font-bold text-dark_brown">
                Version {changelog.version}
              </div>
            )}
            {changelog.from_commit && changelog.to_commit && (
              <div className="text-xs text-clay_brown font-mono">
                {changelog.from_commit.substring(0, 7)}...{changelog.to_commit.substring(0, 7)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            changelog.status === 'published' 
              ? 'bg-golden_brown text-cream' 
              : 'bg-clay_brown text-cream'
          }`}>
            {changelog.status}
          </span>
          {/* Remove button - only show if user owns the GitHub repo */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-accent_red hover:bg-accent_red hover:text-cream rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Delete changelog"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Changelog Content */}
      <div className="space-y-4">
        {/* Creation Info */}
        <div className="flex justify-between items-center text-xs text-clay_brown">
          <span>Created {formatChangelogDate(changelog.created_at)}</span>
          <span>Chronicle #{changelog.id.split('-')[0]}</span>
        </div>

        {/* Content Sections */}
        <div className="prose prose-sm max-w-none">
          <div 
            className="text-dark_brown font-sans leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: changelog.summary_final.replace(/\n/g, '<br/>') 
            }} 
          />
        </div>
      </div>
    </div>
  );
} 