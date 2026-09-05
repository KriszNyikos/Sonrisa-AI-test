import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID (UUID v4)
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generates an ID with a prefix for better readability
 * Example: alert_550e8400-e29b-41d4-a716-446655440000
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${uuidv4()}`;
}

/**
 * Generates a unique timestamp-based ID
 */
export function generateTimestampId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const id = `${timestamp}${random}`;
  return prefix ? `${prefix}_${id}` : id;
}
