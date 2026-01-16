export interface StorageOptions {
    /** Use localStorage (persists across sessions) or sessionStorage (only current session) */
    storage?: 'localStorage' | 'sessionStorage'
    /** Prefix for storage keys */
    keyPrefix?: string
    /** Serialize function for custom serialization */
    serialize?: (data: unknown) => string
    /** Deserialize function for custom deserialization */
    deserialize?: (data: string) => unknown
  }