'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import axios, { isAxiosError } from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeveloperToolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  React.useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Form inputs
  const [projectName, setProjectName] = React.useState<string>('');
  const [repoUrl, setRepoUrl] = React.useState<string>('');
  const [numCommits, setNumCommits] = React.useState<number>(10);
  
  // Generated changelog content
  const [finalSummary, setFinalSummary] = React.useState<string>('');
  
  // State management
  const [changelogId, setChangelogId] = React.useState<string>('');
  const [projectId, setProjectId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setError('');
    setFinalSummary('');
    setChangelogId('');
    setProjectId('');

    // Validation
    if (!projectName.trim() || !repoUrl.trim()) {
      setError('Project name and repository URL are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/developer/generate-changelog', {
        project_name: projectName.trim(),
        repo_url: repoUrl.trim(),
        commit_count: numCommits,
      });

      if (response.data.success) {
        setFinalSummary(response.data.summary_final || response.data.ai_summary || '');
        setChangelogId(response.data.changelog_id || '');
        setProjectId(response.data.project_id || '');
      } else {
        setError(response.data.error || 'Failed to generate changelog');
      }
    } catch (err) {
      console.error('[ERROR] Failed to generate changelog:', err);
      
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!changelogId || !finalSummary.trim()) {
      setError('Cannot publish: Missing changelog ID or final summary');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/developer/publish-changelog', {
        changelog_id: changelogId,
        summary_final: finalSummary.trim(),
      });

      if (response.data.success) {
        // Redirect to project page after a brief delay
        setTimeout(() => {
          if (projectId) {
            router.push(`/projects/${projectId}`);
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setError(response.data.error || 'Failed to publish changelog');
      }
    } catch (err) {
      console.error('[ERROR] Failed to publish changelog:', err);
      
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to publish changelog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-body_dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-dark_accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-dark_accent font-cuneiform">Checking authentication...</p>
        </div>
      </main>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-light_beige p-8 text-lg font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-dark_brown hover:text-accent_red transition-colors duration-300 font-sans text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 text-dark_brown">𒂷</div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark_brown mb-4 font-serif">
            Developer Chronicles
          </h1>
          <p className="text-xl text-clay_brown font-serif max-w-2xl mx-auto">
            Transform your repository into ancient wisdom with AI-powered changelog generation
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-cream border-2 border-clay_brown rounded-lg p-8 mb-8 shadow-lg">
                      <form onSubmit={handleGenerate} className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-lg font-medium text-dark_brown mb-3 font-serif">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-4 text-lg border-2 border-clay_brown rounded-lg focus:ring-2 focus:ring-golden_brown focus:border-golden_brown bg-light_beige text-dark_brown placeholder-clay_brown font-sans"
                  required
                />
              </div>

              {/* Repository URL Input */}
              <div>
                <label htmlFor="repoUrl" className="block text-lg font-medium text-dark_brown mb-3 font-serif">
                  Repository URL
                </label>
                <input
                  type="url"
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-4 text-lg border-2 border-clay_brown rounded-lg focus:ring-2 focus:ring-golden_brown focus:border-golden_brown bg-light_beige text-dark_brown placeholder-clay_brown font-sans"
                  required
                />
              </div>

              {/* Number of Commits */}
              <div>
                <label htmlFor="numCommits" className="block text-lg font-medium text-dark_brown mb-3 font-serif">
                  Number of Commits (1-100)
                </label>
                <input
                  type="number"
                  id="numCommits"
                  value={numCommits}
                  onChange={(e) => setNumCommits(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-4 py-4 text-lg border-2 border-clay_brown rounded-lg focus:ring-2 focus:ring-golden_brown focus:border-golden_brown bg-light_beige text-dark_brown placeholder-clay_brown font-sans"
                />
                <p className="text-sm text-clay_brown mt-2 font-sans">
                  How many recent commits to summarize.
                </p>
              </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-accent_red text-cream rounded-lg border-2 border-accent_red">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-golden_brown hover:bg-accent_red disabled:bg-clay_brown text-cream font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg font-serif disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Chronicle...' : 'Generate Changelog'}
            </button>
          </form>
        </div>

                  {/* Editable Changelog Content */}
          {finalSummary && (
            <div className="bg-cream border-2 border-clay_brown rounded-lg p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-dark_brown font-serif">
                  Generated Chronicle (Editable)
                </h2>
                <div className="text-3xl text-golden_brown">𒀭</div>
              </div>
              
              <textarea
                value={finalSummary}
                onChange={(e) => setFinalSummary(e.target.value)}
                rows={12}
                className="w-full px-4 py-4 rounded-lg border-2 border-clay_brown bg-light_beige text-dark_brown font-mono text-lg resize-vertical focus:ring-2 focus:ring-golden_brown focus:border-golden_brown"
                placeholder="Edit your changelog content here..."
                disabled={loading}
              />
              
              {/* Publish Button */}
              {changelogId && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handlePublish}
                    disabled={loading || !finalSummary.trim()}
                    className="bg-golden_brown hover:bg-accent_red disabled:bg-clay_brown text-cream font-bold px-8 py-4 rounded-lg transition-colors duration-300 text-lg font-serif disabled:cursor-not-allowed"
                  >
                    {loading ? 'Publishing...' : 'Publish Chronicle'}
                  </button>
                </div>
              )}
            </div>
          )}
      </div>
    </main>
  );
} 