/**
 * Serializer for job payloads.
 *
 * Provides serialization and deserialization of job data.
 */
export interface Serializer {
  /** Serialize data to a string. */
  serialize<T>(data: T): string;
  /** Deserialize a string to data. */
  deserialize<T>(data: string): T;
}
