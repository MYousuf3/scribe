import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id: string;
  github_id: number;
  username: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  access_token: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  github_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    sparse: true // Allows multiple null values but enforces uniqueness for non-null values
  },
  name: {
    type: String
  },
  avatar_url: {
    type: String
  },
  access_token: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Static method to find or create user from GitHub data
userSchema.statics.findOrCreateFromGitHub = async function(githubUser: any, accessToken: string) {
  let user = await this.findOne({ github_id: githubUser.id });
  
  if (user) {
    // Update existing user with latest data
    user.username = githubUser.login;
    user.email = githubUser.email;
    user.name = githubUser.name;
    user.avatar_url = githubUser.avatar_url;
    user.access_token = accessToken;
    await user.save();
  } else {
    // Create new user
    user = new this({
      github_id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatar_url: githubUser.avatar_url,
      access_token: accessToken
    });
    await user.save();
  }
  
  return user;
};

// Ensure indexes are created
userSchema.index({ github_id: 1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 