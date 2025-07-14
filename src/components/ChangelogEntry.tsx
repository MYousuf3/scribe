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
            <li key={index} className="text-ink-dark leading-relaxed mb-1">
              {bulletContent}
            </li>
          );
        }
        
        // Handle numbered lists (1. 2. etc.)
        if (/^\d+\.\s/.test(trimmedLine)) {
          const listContent = trimmedLine.replace(/^\d+\.\s/, '').trim();
          return (
            <li key={index} className="text-ink-dark leading-relaxed mb-1 list-decimal">
              {listContent}
            </li>
          );
        }
        
        // Handle headers (## or ###)
        if (trimmedLine.startsWith('## ')) {
          const headerContent = trimmedLine.substring(3).trim();
          return (
            <h3 key={index} className="text-lg font-bold text-ink-dark mt-4 mb-2 font-cuneiform">
              {headerContent}
            </h3>
          );
        }
        
        if (trimmedLine.startsWith('### ')) {
          const headerContent = trimmedLine.substring(4).trim();
          return (
            <h4 key={index} className="text-base font-semibold text-ink-dark mt-3 mb-1 font-cuneiform">
              {headerContent}
            </h4>
          );
        }
        
        // Regular paragraph
        if (trimmedLine) {
          return (
            <p key={index} className="text-ink-dark leading-relaxed mb-2">
              {trimmedLine}
            </p>
          );
        }
        
        // Empty line
        return <br key={index} />;
      });
  };

  return (
    <div className="bg-clay-medium border-2 border-clay-dark font-cuneiform rounded-lg shadow-clay-outset p-6 mb-6">
      {/* Cuneiform Inscription Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-clay-dark">
        <div className="flex items-center space-x-4">
          {/* Ancient symbols */}
          <div className="text-2xl text-terracotta-600">𒀭</div>
          
          {/* Version and Commit Range */}
          <div className="flex flex-col space-y-1">
            {changelog.version && (
              <div className="text-sm font-bold text-ink-dark bg-clay-light px-3 py-1 rounded border border-clay-dark">
                Version {changelog.version}
              </div>
            )}
            <div className="text-xs text-ink-medium font-mono bg-clay-light px-2 py-1 rounded border border-clay-dark">
              {formatCommitCount(changelog.commit_hashes)}
            </div>
          </div>
          
          <div className="text-2xl text-terracotta-600">𒌋</div>
        </div>
        
        {/* Published Date and Actions */}
        <div className="flex items-center space-x-3">
          <div className="text-sm text-ink-medium font-cuneiform">
            {formatChangelogDate(changelog.published_at)}
          </div>
          
          {/* Delete Button for Owners */}
          {isOwner && (
            <div className="relative">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1 text-sm text-ink-medium hover:text-red-600 hover:bg-red-50 rounded transition-colors font-cuneiform"
                  title="Delete Changelog"
                  disabled={isDeleting}
                >
                  remove
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded px-2 py-1">
                  <span className="text-xs text-red-800 font-medium">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Changelog Content with Markdown-like Rendering */}
      <div className="prose prose-sm max-w-none mb-4">
        <div className="text-ink-dark">
          {renderMarkdownContent(changelog.summary_final)}
        </div>
      </div>

      {/* Status and Decorative Elements */}
      <div className="mt-4 pt-4 border-t border-clay-dark">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded text-xs font-medium font-cuneiform ${
              changelog.status === 'published' 
                ? 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300'
                : 'bg-stone-medium text-ink-medium border border-clay-dark'
            }`}>
              {changelog.status.charAt(0).toUpperCase() + changelog.status.slice(1)}
            </span>
            
            {/* Ancient cuneiform decoration */}
            <div className="text-lg text-terracotta-500">𒊹</div>
          </div>
          
          {/* Decorative clay line */}
          <div className="flex items-center space-x-1">
            <div className="w-6 h-1 bg-gradient-to-r from-terracotta-400 to-terracotta-600 rounded-full"></div>
            <div className="text-sm text-terracotta-500">𒈾</div>
            <div className="w-6 h-1 bg-gradient-to-r from-terracotta-600 to-terracotta-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 