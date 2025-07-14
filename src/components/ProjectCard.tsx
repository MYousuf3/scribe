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

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-clay_brown rounded-lg border-b-2 border-accent_red font-cuneiform p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-golden_brown">
        {/* Clay tablet header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl text-dark_brown">Ψ</div>
          <div className="text-sm text-cream font-medium">
            Updated {formatProjectDate(project.updated_at)}
          </div>
        </div>
        {/* Project name */}
        <h3 className="text-xl font-bold text-dark_brown mb-2 font-serif">
          {project.name}
        </h3>
        {/* Description */}
        {project.description && (
          <p className="text-cream text-sm mb-4 line-clamp-3 font-sans">
            {project.description}
          </p>
        )}
        {/* Repository URL */}
        <div className="flex items-center text-xs text-cream">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent_red rounded-full"></div>
            <span className="truncate font-mono">
              {project.repository_url?.replace('https://github.com/', '') || 'Repository'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 