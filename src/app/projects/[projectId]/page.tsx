'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ChangelogEntry from '../../../components/ChangelogEntry';
import Link from 'next/link';
import { formatProjectDate } from '../../../lib/dateUtils';

interface Changelog {
  _id: string;
  id: string;
  project_id: string;
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
  created_at: Date;
  updated_at: Date;
}

export default function ProjectChangelogPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [changelogs, setChangelogs] = React.useState<Changelog[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [projectName, setProjectName] = React.useState<string>('');
  const [project, setProject] = React.useState<Project | null>(null);

  React.useEffect(() => {
    const fetchProjectAndChangelogs = async () => {
      if (!projectId) {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // First, fetch project details to get the name
        const projectResponse = await axios.get('/api/projects');
        const allProjects = projectResponse.data.projects;
        const currentProject = allProjects.find((p: Project) => p.id === projectId || p._id === projectId);
        
        if (currentProject) {
          setProjectName(currentProject.name);
          setProject(currentProject);
        } else {
          setError('Project not found');
          setLoading(false);
          return;
        }

        // Then fetch changelogs for this project
        const changelogsResponse = await axios.get(`/api/projects/${projectId}/changelogs`);
        setChangelogs(changelogsResponse.data.changelogs || []);
        
      } catch (err) {
        console.error('[ERROR] Failed to fetch project or changelogs:', err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Project not found');
        } else {
          setError('Failed to load project changelogs. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndChangelogs();
  }, [projectId]);

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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-clay-medium border-t-terracotta-600 mb-4"></div>
            <p className="text-ink-medium text-lg font-cuneiform">Deciphering ancient scrolls...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6 text-center">
              <div className="text-4xl text-red-600 mb-2">⚠</div>
              <p className="text-red-800 font-medium font-cuneiform">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Project Header */}
        {!loading && !error && project && (
          <>
            <header className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-terracotta-600 to-terracotta-800 text-transparent bg-clip-text mb-4">
                <h1 className="text-3xl md:text-5xl font-bold tracking-wider font-cuneiform">
                  {projectName}
                </h1>
              </div>
              <p className="text-lg text-ink-medium font-cuneiform max-w-3xl mx-auto leading-relaxed">
                Chronicle of Changes • {formatProjectDate(project.updated_at)}
              </p>
              {project.description && (
                <p className="text-ink-medium mt-2 max-w-2xl mx-auto">
                  {project.description}
                </p>
              )}
            </header>

            {/* Repository Info */}
            <div className="bg-clay-medium rounded-lg shadow-clay-inset border border-clay-dark p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xl text-terracotta-600">⟨</div>
                  <div className="text-sm text-ink-medium font-cuneiform">Repository</div>
                  <div className="text-xl text-terracotta-600">⟩</div>
                </div>
                <div className="text-sm text-ink-dark font-mono">
                  {project.repository_url}
                </div>
              </div>
            </div>

            {/* Changelogs Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ink-dark font-cuneiform">
                  Recorded Entries
                </h2>
                <div className="text-sm text-ink-medium font-cuneiform">
                  {changelogs.length} changelog{changelogs.length !== 1 ? 's' : ''}
                </div>
              </div>

              {changelogs.length > 0 ? (
                <div className="space-y-6">
                  {changelogs.map((changelog) => (
                    <ChangelogEntry key={changelog._id} changelog={changelog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-clay-dark mb-4">⌘</div>
                  <h3 className="text-2xl font-bold text-ink-dark mb-2 font-cuneiform">
                    No Chronicles Found
                  </h3>
                  <p className="text-ink-medium mb-6 font-cuneiform">
                    This tablet awaits the first entries of your development journey.
                  </p>
                  <Link
                    href="/developer"
                    className="bg-terracotta-600 text-white px-6 py-3 rounded-lg hover:bg-terracotta-700 transition-colors duration-300 font-cuneiform"
                  >
                    Generate First Changelog
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
} 