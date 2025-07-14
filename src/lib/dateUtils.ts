/**
 * Utility functions for consistent date formatting across server and client
 * Prevents hydration mismatches by ensuring deterministic output
 */

/**
 * Format a date consistently for display in project cards
 * Uses explicit formatting to avoid locale differences between server/client
 */
export function formatProjectDate(date: Date | string): string {
  const d = new Date(date);
  
  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const year = d.getUTCFullYear();
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Format a date consistently for display in changelog entries
 * Includes time information with explicit formatting
 */
export function formatChangelogDate(date: Date | string): string {
  const d = new Date(date);
  
  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const year = d.getUTCFullYear();
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hours = d.getUTCHours().toString().padStart(2, '0');
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');
  
  return `${month} ${day}, ${year} at ${hours}:${minutes} UTC`;
} 