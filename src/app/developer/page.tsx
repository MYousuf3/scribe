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
  const [commitCount, setCommitCount] = React.useState<number>(10);
  
  // Generated changelog content
  const [finalSummary, setFinalSummary] = React.useState<string>('');
  
  // State management
  const [changelogId, setChangelogId] = React.useState<string>('');
  const [projectId, setProjectId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setError('');
    setMessage('');
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
      setMessage('Generating changelog...');
      
      const response = await axios.post('/api/developer/generate-changelog', {
        project_name: projectName.trim(),
        repo_url: repoUrl.trim(),
        commit_count: commitCount,
      });

      if (response.data.success) {
        setFinalSummary(response.data.summary_final || response.data.ai_summary || '');
        setChangelogId(response.data.changelog_id || '');
        setProjectId(response.data.project_id || '');
        setMessage('Changelog generated successfully!');
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
      setMessage('Publishing changelog...');

      const response = await axios.post('/api/developer/publish-changelog', {
        changelog_id: changelogId,
        summary_final: finalSummary.trim(),
      });

      if (response.data.success) {
        setMessage('Changelog published successfully! Redirecting...');
        
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
      <main className="min-h-screen bg-gradient-to-br from-stone-light to-clay-light p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-ink-dark border-t-transparent mx-auto mb-4"></div>
          <p className="text-ink-dark font-cuneiform">Checking authentication...</p>
        </div>
      </main>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-light to-clay-light p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-ink-medium hover:text-ink-dark transition-colors duration-300 font-cuneiform"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project Archives
          </Link>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-terracotta-600 to-terracotta-800 text-transparent bg-clip-text mb-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider font-cuneiform">
              Scribe&apos;s Workshop
            </h1>
          </div>
          <p className="text-lg text-ink-medium font-cuneiform max-w-3xl mx-auto leading-relaxed">
            Generate intelligent changelogs from your git commits using ancient wisdom and modern AI
          </p>
        </header>

        {/* Form Section */}
        <div className="bg-clay-medium border-2 border-clay-dark rounded-lg shadow-clay-outset p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="text-3xl text-terracotta-600 mr-3">𒀭</div>
            <h2 className="text-2xl font-bold text-ink-dark font-cuneiform">
              Generate New Chronicle
            </h2>
            <div className="text-3xl text-terracotta-600 ml-3">𒌋</div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-ink-dark font-cuneiform mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name"
                className="w-full px-4 py-3 rounded-lg border border-clay-dark bg-clay-light text-ink-dark placeholder-ink-medium focus:outline-none focus:border-terracotta-500 focus:bg-stone-light transition-all duration-300 font-cuneiform"
                disabled={loading}
              />
            </div>

            {/* Repository URL */}
            <div>
              <label className="block text-sm font-medium text-ink-dark font-cuneiform mb-2">
                Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 rounded-lg border border-clay-dark bg-clay-light text-ink-dark placeholder-ink-medium focus:outline-none focus:border-terracotta-500 focus:bg-stone-light transition-all duration-300 font-cuneiform"
                disabled={loading}
              />
            </div>

            {/* Commit Range (Optional) */}
            <div>
              <label className="block text-sm font-medium text-ink-dark font-cuneiform mb-2">
                Number of Commits <span className="text-ink-medium">(1-100)</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={commitCount}
                onChange={(e) => setCommitCount(parseInt(e.target.value, 10) || 10)}
                placeholder="10"
                className="w-full px-4 py-3 rounded-lg border border-clay-dark bg-clay-light text-ink-dark placeholder-ink-medium focus:outline-none focus:border-terracotta-500 focus:bg-stone-light transition-all duration-300 font-cuneiform"
                disabled={loading}
              />
              <p className="text-xs text-ink-medium mt-1 font-cuneiform">
                𒀀 Each commit will become its own changelog entry
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !projectName.trim() || !repoUrl.trim()}
                className="bg-terracotta-600 text-white px-8 py-3 rounded-lg hover:bg-terracotta-700 disabled:bg-clay-dark disabled:cursor-not-allowed transition-colors duration-300 font-cuneiform font-medium flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deciphering Commits...</span>
                  </>
                ) : (
                  <>
                    <span>𒊹</span>
                    <span>Generate Changelog</span>
                    <span>𒊹</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="bg-terracotta-100 border border-terracotta-300 rounded-lg p-4 mb-6">
            <p className="text-terracotta-800 font-cuneiform text-center">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-cuneiform text-center">{error}</p>
          </div>
        )}

        {/* Editable Changelog Content */}
        {finalSummary && (
          <div className="bg-clay-light border-2 border-clay-dark rounded-lg shadow-clay-inset p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl text-terracotta-600 mr-3">𒈾</div>
              <h3 className="text-xl font-bold text-ink-dark font-cuneiform">
                Generated Changelog (Editable)
              </h3>
            </div>
            <textarea
              value={finalSummary}
              onChange={(e) => setFinalSummary(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-lg border border-clay-dark bg-stone-light text-ink-dark font-mono text-sm resize-vertical focus:outline-none focus:border-terracotta-500 transition-all duration-300"
              placeholder="Edit your changelog content here..."
              disabled={loading}
            />
            
            {/* Publish Button */}
            {changelogId && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handlePublish}
                  disabled={loading || !finalSummary.trim()}
                  className="bg-terracotta-600 text-white px-8 py-3 rounded-lg hover:bg-terracotta-700 disabled:bg-clay-dark disabled:cursor-not-allowed transition-colors duration-300 font-cuneiform font-medium flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <span>𒀭</span>
                      <span>Publish Chronicle</span>
                      <span>𒀭</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="text-4xl text-clay-dark mb-4">Ψ</div>
          <p className="text-ink-medium font-cuneiform">
            Ancient scribes chronicled the great deeds of kings.<br/>
            Modern developers chronicle the evolution of code.
          </p>
        </div>
      </div>
    </main>
  );
} 