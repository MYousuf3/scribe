import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// TypeScript interface for Changelog document
export interface IChangelog extends Document {
  id: string; // Custom UUID field
  project_id: string; // Reference to Project.id
  created_by?: string; // Reference to User.id - optional for backward compatibility
  version: string;
  summary_ai: string;
  summary_final?: string; // Optional - user-edited final version
  commit_hashes: string[];
  generated_at: Date;
  published_at?: Date; // Optional - set when published
  status: 'draft' | 'published';
}

// Changelog Mongoose schema
const ChangelogSchema = new Schema<IChangelog>({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true, // Index for faster lookups
  },
  project_id: {
    type: String,
    required: true,
    index: true, // Index for project-changelog relationships
    validate: {
      validator: function(id: string) {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
      },
      message: 'Invalid project_id UUID format'
    }
  },
  created_by: {
    type: String,
    index: true, // Index for user-changelog relationships
    sparse: true, // Allows null values for backward compatibility
    validate: {
      validator: function(id: string) {
        if (!id) return true; // Allow null/undefined for backward compatibility
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
      },
      message: 'Invalid created_by UUID format'
    }
  },
  version: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    validate: {
      validator: function(version: string) {
        // Validate date-based version format (YYYY.MM.DD-HHMM)
        const versionRegex = /^\d{4}\.\d{2}\.\d{2}-\d{4}$/;
        return versionRegex.test(version);
      },
      message: 'Version must be in format YYYY.MM.DD-HHMM'
    }
  },
  summary_ai: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000, // Large text field for AI-generated content
  },
  summary_final: {
    type: String,
    required: false,
    trim: true,
    maxlength: 10000, // Optional user-edited final version
  },
  commit_hashes: [{
    type: String,
    required: true,
    validate: {
      validator: function(hash: string) {
        // Validate Git commit hash format (40 character hex string)
        const hashRegex = /^[a-f0-9]{40}$/i;
        return hashRegex.test(hash);
      },
      message: 'Invalid commit hash format'
    }
  }],
  generated_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  published_at: {
    type: Date,
    required: false,
    index: true, // Index for date-based sorting of published changelogs
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true, // Index for filtering by status
  },
}, {
  // Schema options
  timestamps: false, // We'll handle timestamps manually
  versionKey: false, // Remove __v field
  toJSON: {
    transform: function(doc, ret) {
      // Remove MongoDB _id from JSON output, keep our custom id
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Remove MongoDB _id from object output, keep our custom id
      delete ret._id;
      return ret;
    }
  }
});

// Only keep indexes that are NOT already defined in schema fields or are compound indexes
ChangelogSchema.index({ published_at: -1 }); // For date-based sorting
ChangelogSchema.index({ project_id: 1, status: 1 }); // Compound index for common queries  
ChangelogSchema.index({ project_id: 1, published_at: -1 }); // For project changelog history
ChangelogSchema.index({ created_by: 1, status: 1 }, { sparse: true }); // For user's changelogs by status

// Static methods for the model
ChangelogSchema.statics.findByProjectId = function(project_id: string, status?: 'draft' | 'published') {
  const query: any = { project_id };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ published_at: -1, generated_at: -1 });
};

ChangelogSchema.statics.findByCustomId = function(id: string) {
  return this.findOne({ id });
};

ChangelogSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).sort({ published_at: -1 });
};

ChangelogSchema.statics.findDrafts = function() {
  return this.find({ status: 'draft' }).sort({ generated_at: -1 });
};

ChangelogSchema.statics.findByUser = function(created_by: string, status?: 'draft' | 'published') {
  const query: any = { created_by };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ published_at: -1, generated_at: -1 });
};

// Instance methods
ChangelogSchema.methods.publish = function(summary_final?: string) {
  this.status = 'published';
  this.published_at = new Date();
  if (summary_final) {
    this.summary_final = summary_final;
  }
  return this.save();
};

ChangelogSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.published_at = undefined;
  return this.save();
};

// Pre-save middleware to generate version if not provided
ChangelogSchema.pre('save', function(next) {
  if (!this.version) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.version = `${year}.${month}.${day}-${hours}${minutes}`;
  }
  next();
});

// Create and export the model
const Changelog = mongoose.models.Changelog || mongoose.model<IChangelog>('Changelog', ChangelogSchema);

export default Changelog;

// Helper type for creating new changelogs
export type CreateChangelogInput = {
  project_id: string;
  created_by?: string; // Optional for backward compatibility
  summary_ai: string;
  commit_hashes: string[];
  version?: string; // Optional - will be auto-generated if not provided
};

// Helper type for changelog updates
export type UpdateChangelogInput = Partial<Pick<IChangelog, 'summary_ai' | 'summary_final' | 'version' | 'status'>>;

// Helper type for changelog queries
export type ChangelogQuery = {
  id?: string;
  project_id?: string;
  status?: 'draft' | 'published';
  version?: string;
  generated_after?: Date;
  generated_before?: Date;
  published_after?: Date;
  published_before?: Date;
  search?: string; // For searching in summary content
}; 