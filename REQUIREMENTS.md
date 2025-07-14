# Scribe - AI-Powered Changelog System Requirements

## Project Overview
Scribe is a Next.js web application that automates changelog generation from GitHub repositories using AI (Gemini API) and displays them in a unique "ancient clay and cuneiform" aesthetic.

## Technical Stack
- **Framework**: Next.js 15+ with TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **AI**: Google Gemini API (@google/generative-ai)
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Validation**: Zod
- **Deployment**: Vercel

## Core Features

### 1. Changelog Generation
- **Git Provider**: GitHub only (using GitHub PAT)
- **Default Commit Range**: 30 days from last published changelog or current date
- **AI Processing**: Gemini API for summarizing commit messages
- **Versioning**: Date-based format (YYYY.MM.DD-HHMM)
- **Timeout**: 15 seconds before timing out AI generation
- **Error Handling**: Failed changelogs are discarded (not saved as drafts)

### 2. Project Management
- **URL Validation**: Validate GitHub repository URLs before processing
- **Duplicate Prevention**: Check if repository URL already exists
  - If duplicate found: announce existing project and route to its changelog
  - No multiple projects allowed for same repository
- **Project Identification**: Optimize database indexing by project name

### 3. User Interface
- **Theme**: Ancient clay and cuneiform aesthetic
- **Authentication**: None required (open access)
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Database Schema

### projects Collection
```typescript
{
  _id: ObjectId,
  id: string (UUID),
  name: string,
  repo_url: string (unique index),
  created_at: Date,
  updated_at: Date
}
```

### changelogs Collection
```typescript
{
  _id: ObjectId,
  id: string (UUID),
  project_id: string (UUID reference),
  version: string (date-based),
  summary_ai: string,
  summary_final: string | null,
  commit_hashes: string[],
  generated_at: Date,
  published_at: Date | null,
  status: 'draft' | 'published'
}
```

## API Endpoints

### POST /api/generate-changelog
- **Purpose**: Generate AI changelog from GitHub repository
- **Input**: `{ project_name: string, repo_url: string }`
- **Output**: `{ changelog_id: string, summary_ai: string, version: string }`
- **Logic**: 
  - Validate GitHub URL format
  - Check for duplicate projects by repo_url
  - Fetch commits from GitHub API (30-day range)
  - Generate AI summary with 15s timeout
  - Store as draft changelog

### POST /api/publish-changelog
- **Purpose**: Publish a draft changelog
- **Input**: `{ changelog_id: string, summary_final: string }`
- **Output**: `{ message: string, changelog_id: string }`
- **Logic**: Update changelog status to 'published'

### GET /api/projects
- **Purpose**: Get all published projects
- **Output**: Array of project objects
- **Logic**: Return projects ordered by updated_at descending

### GET /api/projects/[projectId]/changelogs
- **Purpose**: Get published changelogs for a project
- **Query**: `search` (optional)
- **Output**: Array of changelog objects
- **Logic**: Return published changelogs ordered by published_at descending

## Frontend Pages

### 1. Project List Page (`/`)
- Display all projects as clay tablets
- Search and filter functionality
- Click to navigate to project changelog

### 2. Project Detail Page (`/projects/[projectId]`)
- Show all published changelogs for the project
- Individual entries styled as cuneiform inscriptions
- Search within project changelogs

### 3. Developer Tool Page (`/developer`)
- Form to input GitHub repository URL
- Generate changelog functionality
- Review and publish interface
- Error handling for invalid URLs/timeouts

## Components

### Core Components
- **ProjectCard**: Individual project display (clay tablet style)
- **ChangelogEntry**: Individual changelog entry (cuneiform style)
- **LoadingSpinner**: Ancient-themed loading indicator
- **ErrorBoundary**: Error handling component

## Styling Requirements

### Ancient Clay/Cuneiform Aesthetic
- **Color Palette**: Earthy tones (browns, terracotta, muted yellows, charcoal)
- **Typography**: Custom fonts for ancient feel
- **Textures**: Subtle clay/stone backgrounds
- **Elements**: Clay tablet cards with box-shadow depth
- **Effects**: Text shadows for engraved appearance

## Security & Validation

### Input Validation
- **Repository URLs**: Validate GitHub URL format using Zod
- **API Routes**: Validate all inputs with Zod schemas
- **Rate Limiting**: Implement on API routes

### Environment Variables
- `MONGODB_CONNECTION_STRING`: MongoDB Atlas connection
- `GEMINI_API_KEY`: Google Gemini API key
- `GITHUB_PAT`: GitHub Personal Access Token

## Performance Optimizations

### Database Indexes
- **projects.repo_url**: Unique index for duplicate checking
- **projects.name**: Index for name-based searches
- **changelogs.project_id**: Index for project-changelog relationships
- **changelogs.published_at**: Index for date-based sorting

### Caching Strategy
- **Static Generation**: Use Next.js ISR for project list
- **API Responses**: Cache project data appropriately

## Error Handling

### Frontend
- User-friendly error messages
- Loading states for long operations
- Graceful fallbacks for API failures

### Backend
- Comprehensive try-catch blocks
- Informative HTTP status codes
- Detailed error logging

## Deployment Considerations

### Vercel Configuration
- Environment variables setup
- API routes as serverless functions
- Static asset optimization

### MongoDB Atlas
- Connection string configuration
- Database indexes creation
- Backup and monitoring setup

## Development Workflow

### File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── generate-changelog/
│   │   ├── publish-changelog/
│   │   ├── projects/
│   │   └── projects/[projectId]/changelogs/
│   ├── projects/[projectId]/
│   ├── developer/
│   └── page.tsx
├── components/
├── lib/
│   ├── mongodb.ts
│   ├── github.ts
│   ├── gemini.ts
│   └── validation.ts
└── types/
```

### Key Implementation Notes
- Use UUID for all entity IDs
- Implement proper TypeScript types
- Follow Next.js 15 App Router patterns
- Use Mongoose for MongoDB operations
- Implement proper error boundaries
- Use Tailwind CSS for consistent styling 