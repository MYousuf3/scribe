'use client';

import React, { useState } from 'react';
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
  published_at: string; // ISO string from API
  generated_at: string; // ISO string from API
  commit_hashes: string[];
  version: string;
  from_commit?: string;
  to_commit?: string;
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
  created_at: string; // ISO string from API
  updated_at: string; // ISO string from API
}

interface ChangelogEntryProps {
  changelog: Changelog;
  project?: Project;
  onDelete?: (changelogId: string) => void;
}

export default function ChangelogEntry({ changelog, project, onDelete }: ChangelogEntryProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  // Enhanced markdown-like rendering with professional styling
  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: React.ReactElement[] = [];
    let listType: 'ul' | 'ol' | null = null;

    // Process inline markdown formatting
    const processInlineMarkdown = (text: string): React.ReactNode => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let keyIndex = 0;
      
      while (remaining.length > 0) {
        let found = false;
        
        // Check for **bold** (must come before *italic*)
        let match = remaining.match(/\*\*([^*]+?)\*\*/);
        if (match && match.index !== undefined) {
          if (match.index > 0) {
            parts.push(remaining.substring(0, match.index));
          }
          parts.push(<strong key={keyIndex++} className="font-bold text-golden_brown">{match[1]}</strong>);
          remaining = remaining.substring(match.index + match[0].length);
          found = true;
        }
        
        // Check for *italic*
        if (!found) {
          match = remaining.match(/\*([^*]+?)\*/);
          if (match && match.index !== undefined) {
            if (match.index > 0) {
              parts.push(remaining.substring(0, match.index));
            }
            parts.push(<em key={keyIndex++} className="italic text-dark_brown/90">{match[1]}</em>);
            remaining = remaining.substring(match.index + match[0].length);
            found = true;
          }
        }
        
        // Check for `code`
        if (!found) {
          match = remaining.match(/`([^`]+?)`/);
          if (match && match.index !== undefined) {
            if (match.index > 0) {
              parts.push(remaining.substring(0, match.index));
            }
            parts.push(<code key={keyIndex++} className="bg-clay_brown/10 text-accent_red px-1 py-0.5 rounded text-xs font-mono">{match[1]}</code>);
            remaining = remaining.substring(match.index + match[0].length);
            found = true;
          }
        }
        
        // Check for ~~strikethrough~~
        if (!found) {
          match = remaining.match(/~~([^~]+?)~~/);
          if (match && match.index !== undefined) {
            if (match.index > 0) {
              parts.push(remaining.substring(0, match.index));
            }
            parts.push(<del key={keyIndex++} className="line-through text-dark_brown/70">{match[1]}</del>);
            remaining = remaining.substring(match.index + match[0].length);
            found = true;
          }
        }
        
        // If no markdown found, add the rest of the text
        if (!found) {
          parts.push(remaining);
          break;
        }
      }
      
      return parts.length > 1 ? parts : text;
    };

    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListComponent 
            key={`list-${elements.length}`} 
            className={`space-y-1 mb-3 ${listType === 'ol' ? 'list-none' : 'list-none'}`}
          >
            {currentList}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle H1 headers (# for main changelog title)
      if (trimmedLine.startsWith('# ')) {
        flushList();
        const headerContent = trimmedLine.substring(2).trim();
        elements.push(
          <div key={index} className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-golden_brown via-accent_red to-golden_brown rounded-lg blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-cream to-light_beige p-4 rounded-lg border border-golden_brown/30">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-golden_brown to-accent_red bg-clip-text text-transparent font-serif leading-tight">
                {processInlineMarkdown(headerContent)}
              </h1>
              <div className="mt-2 h-1 bg-gradient-to-r from-golden_brown via-accent_red to-golden_brown rounded-full"></div>
            </div>
          </div>
        );
        return;
      }
      
      // Handle H2 headers (## for categories)
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const headerContent = trimmedLine.substring(3).trim();
        elements.push(
          <div key={index} className="flex items-center gap-3 mt-4 mb-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-golden_brown to-accent_red rounded-full text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-dark_brown font-serif group-hover:text-golden_brown transition-colors duration-300">
                {processInlineMarkdown(headerContent)}
              </h2>
              <div className="h-0.5 bg-gradient-to-r from-golden_brown/50 to-transparent rounded-full mt-1"></div>
            </div>
          </div>
        );
        return;
      }
      
      // Handle bullet points (- or * at start of line)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const bulletContent = trimmedLine.substring(2).trim();
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(
          <li key={index} className="flex items-start gap-3 group hover:bg-cream/50 rounded-lg p-2 transition-all duration-200 hover:shadow-sm">
            <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-golden_brown to-accent_red rounded-full mt-1.5 group-hover:scale-125 transition-transform duration-200"></div>
            <span className="text-dark_brown leading-relaxed text-sm font-medium group-hover:text-dark_brown/90">
              {processInlineMarkdown(bulletContent)}
            </span>
          </li>
        );
        return;
      }
      
      // Handle numbered lists (1. 2. etc.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const number = trimmedLine.match(/^(\d+)\./)![1];
        const listContent = trimmedLine.replace(/^\d+\.\s/, '').trim();
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(
          <li key={index} className="flex items-start gap-3 group hover:bg-cream/50 rounded-lg p-2 transition-all duration-200 hover:shadow-sm">
            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-golden_brown to-accent_red rounded-full flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform duration-200">
              {number}
            </div>
            <span className="text-dark_brown leading-relaxed text-sm font-medium group-hover:text-dark_brown/90">
              {processInlineMarkdown(listContent)}
            </span>
          </li>
        );
        return;
      }
      
      // Regular paragraph
      if (trimmedLine) {
        flushList();
        elements.push(
          <p key={index} className="text-dark_brown leading-relaxed mb-2 text-sm font-medium">
            {processInlineMarkdown(trimmedLine)}
          </p>
        );
        return;
      }
      
      // Empty line - handle spacing
      if (!trimmedLine && currentList.length === 0) {
        elements.push(<div key={index} className="mb-1" />);
      }
    });

    // Flush any remaining list
    flushList();

    return elements;
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
    }
  };

  return (
    <article className="relative group mb-4">
      {/* Ambient glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-golden_brown/20 via-accent_red/10 to-golden_brown/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-cream via-light_beige to-cream border border-clay_brown/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
        
        {/* Header with enhanced design */}
        <header className="relative bg-gradient-to-r from-clay_brown/5 to-golden_brown/5 border-b border-clay_brown/20 p-4">
          {/* Decorative pattern overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <pattern id="cuneiform-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <text x="2" y="15" fontSize="16" fontFamily="serif" fill="currentColor">𒀭</text>
              </pattern>
              <rect width="100" height="100" fill="url(#cuneiform-pattern)" />
            </svg>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Enhanced ancient symbol */}
              <div className="relative">
                <div className="absolute inset-0 bg-golden_brown/20 rounded-full animate-pulse"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-golden_brown to-accent_red rounded-full flex items-center justify-center text-cream text-lg shadow-lg">
                  𒀭
                </div>
              </div>
              
              {/* Version info with enhanced styling */}
              <div className="space-y-1">
                {changelog.version && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-golden_brown to-accent_red text-cream text-xs font-bold rounded-full shadow-sm">
                      v{changelog.version}
                    </span>
                  </div>
                )}
                {changelog.from_commit && changelog.to_commit && (
                  <div className="flex items-center gap-2 text-xs text-clay_brown">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <code className="font-mono bg-clay_brown/10 px-2 py-0.5 rounded">
                      {changelog.from_commit.substring(0, 7)}...{changelog.to_commit.substring(0, 7)}
                    </code>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Enhanced status badge */}
              <span className={`relative px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ${
                changelog.status === 'published' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-200'
              }`}>
                <span className="relative z-10 flex items-center gap-1">
                  {changelog.status === 'published' ? '✓' : '⏳'}
                  {changelog.status}
                </span>
                <div className={`absolute inset-0 rounded-full animate-pulse ${
                  changelog.status === 'published' ? 'bg-green-400/30' : 'bg-amber-400/30'
                }`}></div>
              </span>
              
              {/* Enhanced delete button */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="group/btn relative p-2 text-accent_red hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-accent_red hover:to-red-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete changelog"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content area with enhanced spacing and design */}
        <div className="p-4 space-y-3">
          {/* Meta information with enhanced styling */}
          <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-clay_brown/5 to-golden_brown/5 rounded-xl border border-clay_brown/10">
            <div className="flex items-center gap-2 text-xs text-clay_brown">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Created {formatChangelogDate(changelog.generated_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-clay_brown">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Chronicle #{changelog.id.split('-')[0]}</span>
            </div>
          </div>

          {/* Enhanced content rendering */}
          <div className="prose prose-sm max-w-none">
            <div className="space-y-2">
              {renderMarkdownContent(changelog.summary_final)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
} 