'use client';

import * as React from 'react';
import axios from '@/lib/axios';
import ProjectCard from '../components/ProjectCard';
import { Sparkles, Github, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';

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
        const response = await axios.get('/api/projects');
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
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
    <main className="min-h-screen bg-light_beige relative overflow-x-hidden">
      {/* Single Animated Cuneiform Pattern Background for entire page */}
      <svg className="fixed inset-0 w-full h-full opacity-10 z-0 pointer-events-none animate-pulse-slow" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="cuneiform" patternUnits="userSpaceOnUse" width="60" height="60">
          <text x="0" y="40" fontSize="48" fontFamily="serif" fill="#b08150" opacity="0.7">𒀭</text>
        </pattern>
        <rect width="100%" height="100%" fill="url(#cuneiform)" />
      </svg>
      {/* Hero Section */}
      <section className="relative py-24 flex flex-col items-center justify-center text-center bg-transparent z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold text-dark_brown mb-6 font-serif"
        >
          𒂷 Scribe
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-dark_brown mb-8 max-w-3xl font-serif"
        >
          Chronicle of Changes • Ancient wisdom for modern repositories
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 items-center"
        >
          <a
            href="/developer"
            className="inline-flex items-center px-8 py-4 bg-golden_brown text-cream text-lg font-semibold rounded-lg hover:bg-accent_red transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Changelog
          </a>
          <a
            href="https://github.com"
            className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-dark_brown text-dark_brown text-lg font-semibold rounded-lg hover:bg-dark_brown hover:text-cream transition-all duration-300 transform hover:scale-105"
          >
            <Github className="mr-2 h-5 w-5" />
            View on GitHub
          </a>
        </motion.div>
      </section>

      {/* Search and Gallery Section */}
      <section className="relative py-16 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12 flex justify-center"
          >
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ScrollText className="h-5 w-5 text-clay_brown" />
              </div>
              <input
                type="text"
                placeholder="Search repositories and chronicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-4 border-2 border-clay_brown rounded-lg focus:ring-2 focus:ring-golden_brown focus:border-golden_brown bg-cream text-dark_brown placeholder-clay_brown text-lg font-serif"
              />
            </div>
          </motion.div>

          {/* Projects Gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-2xl text-dark_brown font-serif">
                  Loading repositories...
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-2xl text-dark_brown font-serif">
                  {error}
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4 text-clay_brown">𒁹</div>
                <div className="text-2xl text-dark_brown font-serif mb-4">
                  No repositories found
                </div>
                <div className="text-lg text-dark_brown font-serif">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first repository'}
                </div>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Call to Action */}
          {!loading && !error && filteredProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center mt-16"
            >
              <a
                href="/developer"
                className="inline-flex items-center px-8 py-4 bg-golden_brown text-cream text-lg font-semibold rounded-lg hover:bg-accent_red transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create New Chronicle
              </a>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t-2 border-clay_brown bg-light_beige z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4 text-dark_brown">𒀭</div>
          <p className="text-dark_brown font-serif text-lg mb-4">
            Preserve your code&apos;s legacy with the wisdom of ancient scribes
          </p>
          <div className="flex justify-center space-x-8">
            <a href="#" className="text-dark_brown hover:text-accent_red transition-colors font-serif">
              Documentation
            </a>
            <a href="#" className="text-dark_brown hover:text-accent_red transition-colors font-serif">
              Support
            </a>
            <a href="#" className="text-dark_brown hover:text-accent_red transition-colors font-serif">
              Community
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
