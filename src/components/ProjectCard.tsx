import Link from 'next/link';
import { formatProjectDate } from '../lib/dateUtils';

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

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const formatRepoUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-clay-medium rounded-lg shadow-clay-outset border-b-2 border-clay-dark font-cuneiform p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-clay-deep">
        {/* Clay tablet header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl text-ink-dark">Ψ</div>
          <div className="text-sm text-ink-medium font-medium">
            Updated {formatProjectDate(project.updated_at)}
          </div>
        </div>

        {/* Project name */}
        <h3 className="text-xl font-bold text-ink-dark mb-3 leading-tight">
          {project.name}
        </h3>

        {/* Repository URL */}
        <div className="mb-4">
          <div className="text-xs text-ink-medium bg-clay-light px-2 py-1 rounded border border-clay-dark inline-block mb-2">
            Repository
          </div>
          <p className="text-sm text-ink-medium font-mono truncate">
            {formatRepoUrl(project.repository_url)}
          </p>
          {project.github_repo_owner && (
            <p className="text-xs text-ink-medium mt-1">
              Owner: <span className="font-semibold">{project.github_repo_owner}</span>
            </p>
          )}
        </div>

        {/* Project description */}
        {project.description && (
          <p className="text-ink-medium mb-4 text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Updated date */}
        <div className="mt-4 pt-4 border-t border-clay-dark">
          <div className="flex justify-between items-center">
            <div className="text-xs text-ink-medium">
              Created {formatProjectDate(project.created_at)}
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-terracotta-400 to-terracotta-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </Link>
  );
} 