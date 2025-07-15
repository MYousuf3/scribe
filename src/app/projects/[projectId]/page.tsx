'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import axios, { isAxiosError } from '@/lib/axios';
import ChangelogEntry from '../../../components/ChangelogEntry';
import Link from 'next/link';
import { formatProjectDate } from '../../../lib/dateUtils';

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
  created_at: string; // ISO string from API
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

export default function ProjectChangelogPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [changelogs, setChangelogs] = React.useState<Changelog[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
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
        if (isAxiosError(err) && err.response?.status === 404) {
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

  // Handle changelog deletion
  const handleChangelogDelete = (deletedChangelogId: string) => {
    setChangelogs(prevChangelogs => 
      prevChangelogs.filter(changelog => changelog.id !== deletedChangelogId)
    );
  };

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

        {error && (
          <div className="mb-6 p-4 bg-accent_red text-cream rounded-lg border border-accent_red">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-2xl text-dark_brown font-serif">Loading project...</div>
          </div>
        ) : project ? (
          <>
            {/* Project Header */}
            <div className="bg-cream border-2 border-clay_brown rounded-lg p-8 mb-8 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-4xl text-golden_brown">𒂷</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark_brown font-serif">
                      {project.name}
                    </h1>
                  </div>
                  {project.description && (
                    <p className="text-clay_brown text-lg mb-4 font-sans leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center text-clay_brown">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a 
                      href={project.repository_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-accent_red transition-colors duration-300 font-mono"
                    >
                      {project.repository_url}
                    </a>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    href="/developer"
                    className="bg-golden_brown hover:bg-accent_red text-cream px-6 py-3 rounded-lg transition-colors duration-300 font-serif"
                  >
                    Generate New
                  </Link>
                  {/* isOwner and isDeleting are not defined in the original file,
                      so this block is commented out to avoid errors.
                      If these variables were intended to be added, they would need to be declared. */}
                  {/* {isOwner && (
                    <button
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="bg-accent_red hover:bg-dark_brown text-cream px-6 py-3 rounded-lg transition-colors duration-300 font-serif disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </button>
                  )} */}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-clay_brown border-t border-clay_brown pt-4">
                <span>Created {formatProjectDate(project.created_at)}</span>
                <span>Last updated {formatProjectDate(project.updated_at)}</span>
              </div>
            </div>

            {/* Changelogs Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-dark_brown mb-6 font-serif">
                Project Chronicles
              </h2>
              
                             {changelogs && changelogs.length > 0 ? (
                <div className="space-y-6">
                  {changelogs.map((changelog) => (
                    <ChangelogEntry 
                      key={changelog.id} 
                      changelog={changelog} 
                      project={project}
                      onDelete={handleChangelogDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-cream border-2 border-clay_brown rounded-lg">
                  <div className="text-6xl mb-4 text-clay_brown">𒁹</div>
                  <h3 className="text-xl font-bold text-dark_brown mb-2 font-serif">
                    No Chronicles Yet
                  </h3>
                  <p className="text-clay_brown mb-6 font-sans">
                    Generate your first changelog to begin chronicling this project&apos;s evolution.
                  </p>
                  <Link
                    href="/developer"
                    className="inline-block bg-golden_brown hover:bg-accent_red text-cream px-6 py-3 rounded-lg transition-colors duration-300 font-serif"
                  >
                    Create First Chronicle
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-clay_brown">⚠</div>
            <h1 className="text-2xl font-bold text-dark_brown mb-4 font-serif">
              Project Not Found
            </h1>
            <p className="text-clay_brown mb-6 font-sans">
              The project you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-block bg-golden_brown hover:bg-accent_red text-cream px-6 py-3 rounded-lg transition-colors duration-300 font-serif"
            >
              Back to Projects
            </Link>
          </div>
        )}
      </div>
    </main>
  );
} 