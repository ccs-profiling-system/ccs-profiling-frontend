/**
 * Type Guards and Validation Utilities
 * 
 * These functions help prevent runtime errors by validating data types
 * before using them. They're especially useful for:
 * - API responses that might have unexpected structures
 * - Props that could be undefined/null
 * - Array operations that assume the value is an array
 */

/**
 * Check if a value is an array
 * @param value - The value to check
 * @returns true if value is an array, false otherwise
 * 
 * @example
 * if (isArray(data)) {
 *   data.map(...) // Safe to call .map()
 * }
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a non-empty array
 * @param value - The value to check
 * @returns true if value is an array with at least one element
 * 
 * @example
 * if (isNonEmptyArray(items)) {
 *   // items has at least one element
 * }
 */
export function isNonEmptyArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Ensure a value is an array, returning a fallback if it's not
 * @param value - The value to check
 * @param fallback - The fallback array to return if value is not an array
 * @returns The value if it's an array, otherwise the fallback
 * 
 * @example
 * const items = ensureArray(data, []);
 * items.map(...) // Always safe
 */
export function ensureArray<T = unknown>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

/**
 * Check if a value is an object (but not an array or null)
 * @param value - The value to check
 * @returns true if value is a plain object
 * 
 * @example
 * if (isObject(response)) {
 *   response.data // Safe to access properties
 * }
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Extract an array from a potentially wrapped API response
 * Handles common response structures:
 * - Direct array: [...]
 * - Wrapped in data: { data: [...] }
 * - Wrapped in items: { items: [...] }
 * - Wrapped in results: { results: [...] }
 * 
 * @param response - The API response
 * @param fallback - The fallback array if extraction fails
 * @returns The extracted array or fallback
 * 
 * @example
 * const schedules = extractArray(apiResponse, []);
 * // Works with: [...], { data: [...] }, { items: [...] }, etc.
 */
export function extractArray<T = unknown>(
  response: unknown,
  fallback: T[] = []
): T[] {
  // If it's already an array, return it
  if (Array.isArray(response)) {
    return response;
  }

  // If it's an object, try common property names
  if (isObject(response)) {
    // Try common property names in order of likelihood
    const propertyNames = ['data', 'items', 'results', 'records', 'schedules', 'list'];
    
    for (const prop of propertyNames) {
      if (Array.isArray(response[prop])) {
        return response[prop] as T[];
      }
    }
  }

  // If nothing worked, return fallback
  return fallback;
}

/**
 * Validate that a value is of a specific type
 * @param value - The value to check
 * @param type - The expected type ('string', 'number', 'boolean', 'object', 'array')
 * @returns true if value is of the expected type
 * 
 * @example
 * if (isType(value, 'string')) {
 *   value.toUpperCase() // Safe
 * }
 */
export function isType(
  value: unknown,
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
): boolean {
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return isObject(value);
  return typeof value === type;
}

/**
 * Create a type guard for a specific value
 * Useful for narrowing types in conditional branches
 * 
 * @example
 * const isSchedule = createTypeGuard<Schedule>((val) => 
 *   isObject(val) && 'id' in val && 'subject' in val
 * );
 * 
 * if (isSchedule(data)) {
 *   data.subject // TypeScript knows this exists
 * }
 */
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => predicate(value);
}

/**
 * Safely map over an array, handling non-array values
 * @param value - The value to map over
 * @param callback - The mapping function
 * @param fallback - The fallback value if mapping fails
 * @returns The mapped array or fallback
 * 
 * @example
 * const names = safeMap(data, (item) => item.name, []);
 */
export function safeMap<T, R>(
  value: T[] | unknown,
  callback: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  if (!Array.isArray(value)) {
    console.warn('safeMap: Expected array, got', typeof value, value);
    return fallback;
  }
  try {
    return (value as T[]).map(callback);
  } catch (error) {
    console.error('safeMap: Error during mapping', error);
    return fallback;
  }
}

/**
 * Safely filter an array, handling non-array values
 * @param value - The value to filter
 * @param predicate - The filter function
 * @param fallback - The fallback value if filtering fails
 * @returns The filtered array or fallback
 * 
 * @example
 * const active = safeFilter(data, (item) => item.status === 'active', []);
 */
export function safeFilter<T>(
  value: T[] | unknown,
  predicate: (item: T, index: number) => boolean,
  fallback: T[] = []
): T[] {
  if (!Array.isArray(value)) {
    console.warn('safeFilter: Expected array, got', typeof value, value);
    return fallback;
  }
  try {
    return (value as T[]).filter(predicate);
  } catch (error) {
    console.error('safeFilter: Error during filtering', error);
    return fallback;
  }
}
