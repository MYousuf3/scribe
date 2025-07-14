'use client';

import * as React from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

interface Project {
  _id: string;
  id: string;
  name: string;
  description?: string;
  repository_url: string;
  created_at: Date;
  updated_at: Date;
}

export default function ProjectListPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/projects');
        setProjects(response.data.projects || []);
      } catch (err) {
        console.error('[ERROR] Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-amber-800 to-orange-700 text-transparent bg-clip-text">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
              Project Archives
            </h1>
          </div>
          <p className="text-lg md:text-xl text-amber-800 font-medium max-w-3xl mx-auto leading-relaxed">
            Explore your digital codex of projects. Each clay tablet represents a chronicle of development history.
          </p>
        </header>

        {/* Search Input */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500 focus:bg-white transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-300 border-t-amber-600 mb-4"></div>
            <p className="text-amber-700 text-lg">Loading ancient scrolls...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 text-center">
              <div className="text-4xl text-red-600 mb-2">⚠️</div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            {/* Results Summary */}
            <div className="text-center mb-8">
                             <p className="text-amber-700 font-medium">
                 {searchTerm ? (
                   <>Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;</>
                 ) : (
                   <>Displaying {projects.length} project{projects.length !== 1 ? 's' : ''}</>
                 )}
               </p>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl text-amber-400 mb-4">Ψ</div>
                <h3 className="text-2xl font-bold text-amber-800 mb-2">
                  {searchTerm ? 'No Matching Scrolls Found' : 'No Projects Found'}
                </h3>
                <p className="text-amber-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find relevant projects.'
                    : 'Create your first project to begin chronicling your development journey.'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors duration-300"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
