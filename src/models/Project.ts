import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// TypeScript interface for Project document
export interface IProject extends Document {
  id: string; // Custom UUID field
  name: string;
  repo_url: string;
  created_at: Date;
  updated_at: Date;
}

// Project Mongoose schema
const ProjectSchema = new Schema<IProject>({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true, // Index for faster lookups
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true, // Index for name-based searches
  },
  repo_url: {
    type: String,
    required: true,
    unique: true, // Unique index for duplicate prevention
    trim: true,
    validate: {
      validator: function(url: string) {
        // Validate GitHub URL format
        const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
        return githubUrlRegex.test(url);
      },
      message: 'Invalid GitHub repository URL format'
    },
    index: true, // Explicit index for duplicate checking
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  // Schema options
  timestamps: false, // We'll handle timestamps manually for more control
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

// Pre-save middleware to update updated_at on save
ProjectSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Pre-update middleware to update updated_at on updates
ProjectSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Indexes for performance optimization
ProjectSchema.index({ name: 1 }); // For name-based searches
ProjectSchema.index({ repo_url: 1 }, { unique: true }); // For duplicate checking
ProjectSchema.index({ created_at: -1 }); // For sorting by creation date
ProjectSchema.index({ updated_at: -1 }); // For sorting by update date

// Static methods for the model
ProjectSchema.statics.findByRepoUrl = function(repo_url: string) {
  return this.findOne({ repo_url });
};

ProjectSchema.statics.findByCustomId = function(id: string) {
  return this.findOne({ id });
};

// Instance methods
ProjectSchema.methods.updateTimestamp = function() {
  this.updated_at = new Date();
  return this.save();
};

// Create and export the model
const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;

// Helper type for creating new projects
export type CreateProjectInput = {
  name: string;
  repo_url: string;
};

// Helper type for project updates
export type UpdateProjectInput = Partial<Pick<IProject, 'name' | 'repo_url'>>;

// Helper type for project queries
export type ProjectQuery = {
  id?: string;
  name?: string;
  repo_url?: string;
  created_after?: Date;
  created_before?: Date;
  updated_after?: Date;
  updated_before?: Date;
}; 