import mongoose, { Connection } from 'mongoose';

// Extend the global object to include mongoose connection caching
declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;

// Initialize the global mongoose object for caching
global.mongoose = global.mongoose || {
  conn: null,
  promise: null,
};

/**
 * MongoDB connection utility with connection caching for Next.js API routes
 * Ensures connection reuse across multiple API route invocations
 */
export default async function connectToDatabase(): Promise<Connection> {
  // Check for MongoDB URI at runtime
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_CONNECTION_STRING environment variable inside .env');
  }

  // Return existing connection if available
  if (global.mongoose.conn) {
    console.log('Using existing MongoDB connection');
    return global.mongoose.conn;
  }

  // Return existing promise if connection is in progress
  if (global.mongoose.promise) {
    console.log('⏳ Awaiting existing MongoDB connection promise');
    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
  }

  // MongoDB connection options optimized for Atlas and serverless environments
  const options = {
    bufferCommands: false, // Disable mongoose buffering for serverless
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true, // Retry failed writes
    w: 'majority' as const, // Write concern
  };

      console.log('Creating new MongoDB connection...');

  // Create new connection promise
  global.mongoose.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  }).catch((error) => {
    console.error('MongoDB connection failed:', error);
    global.mongoose.promise = null; // Reset promise on failure
    throw error;
  });

  // Wait for the connection and cache it
  try {
    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
  } catch (error) {
    global.mongoose.promise = null; // Reset promise on failure
    throw error;
  }
}

/**
 * Disconnect from MongoDB (mainly for testing or cleanup)
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (global.mongoose.conn) {
    await mongoose.disconnect();
    global.mongoose.conn = null;
    global.mongoose.promise = null;
    console.log('📤 MongoDB disconnected');
  }
}

/**
 * Get the current connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  readyStateText: string;
} {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;
  
  return {
    isConnected: readyState === 1,
    readyState,
    readyStateText: readyStates[readyState as keyof typeof readyStates] || 'unknown',
  };
}

/**
 * Health check function for MongoDB connection
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: unknown;
}> {
  try {
    const connection = await connectToDatabase();
    
    // Test the connection by running a simple command
    await connection.db?.admin().ping();
    
    return {
      status: 'healthy',
      message: 'MongoDB connection is healthy',
      details: getConnectionStatus(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'MongoDB connection is unhealthy',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Connection event handlers for monitoring
if (typeof window === 'undefined') {
  // Only run on server-side
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📤 Mongoose disconnected from MongoDB');
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
}
