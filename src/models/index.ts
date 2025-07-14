// Export all models and their related types
export { default as Project } from './Project';
export { default as Changelog } from './Changelog';

// Export TypeScript interfaces
export type { IProject, CreateProjectInput, UpdateProjectInput, ProjectQuery } from './Project';
export type { IChangelog, CreateChangelogInput, UpdateChangelogInput, ChangelogQuery } from './Changelog'; 