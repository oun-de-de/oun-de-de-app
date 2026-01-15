/* eslint-disable no-unused-vars */
import { StorageOptions } from "@/types/storage-options";


export class LocalStorageService {
  private static _options: Required<StorageOptions> = {
    storage: "localStorage",
    keyPrefix: "app:",
    serialize: (data) => JSON.stringify(data, this._getCircularReplacer()),
    deserialize: (raw) => JSON.parse(raw),
  };

  static configure(options?: StorageOptions): void {
    this._options = { ...this._options, ...options };
  }

  // ---------------- Public API ----------------

  static save(key: string, data: unknown): boolean {
    try {
      const storage = this._storage();
      storage.setItem(this._key(key), this._options.serialize(data));
      return true;
    } catch (e) {
      console.warn(`[LocalStorageService] save failed: ${key}`, e);
      return false;
    }
  }

  static load<T>(key: string, defaultValue: T): T {
    try {
      const storage = this._storage();
      const raw = storage.getItem(this._key(key));
      if (!raw) return defaultValue;
      return this._options.deserialize(raw) as T;
    } catch (e) {
      console.warn(`[LocalStorageService] load failed: ${key}`, e);
      return defaultValue;
    }
  }

  static loadOrNull<T>(key: string): T | null {
    try {
      const storage = this._storage();
      const raw = storage.getItem(this._key(key));
      if (!raw) return null;
      return this._options.deserialize(raw) as T;
    } catch (e) {
      console.warn(`[LocalStorageService] loadOrNull failed: ${key}`, e);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      this._storage().removeItem(this._key(key));
    } catch (e) {
      console.warn(`[LocalStorageService] remove failed: ${key}`, e);
    }
  }

  static clear(): void {
    try {
      const storage = this._storage();
      const prefix = this._options.keyPrefix;

      for (let i = storage.length - 1; i >= 0; i--) {
        const k = storage.key(i);
        if (k && k.startsWith(prefix)) {
          storage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn("[LocalStorageService] clear failed", e);
    }
  }

  static isAvailable(): boolean {
    try {
      const s = this._storage();
      const t = "__ls_test__";
      s.setItem(t, t);
      s.removeItem(t);
      return true;
    } catch {
      return false;
    }
  }

  static getSize(): number {
    try {
      const storage = this._storage();
      let size = 0;

      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (!k) continue;
        const v = storage.getItem(k);
        if (v) size += k.length + v.length;
      }

      return size;
    } catch {
      return 0;
    }
  }

  static getKeys(): string[] {
    try {
      const storage = this._storage();
      const prefix = this._options.keyPrefix;
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(prefix)) {
          keys.push(k.slice(prefix.length));
        }
      }

      return keys;
    } catch {
      return [];
    }
  }

  // ---------------- Internals ----------------

  private static _storage(): Storage {
    if (typeof window === "undefined") {
      throw new TypeError("Storage is only available in browser");
    }

    return this._options.storage === "sessionStorage"
      ? window.sessionStorage
      : window.localStorage;
  }

  private static _key(key: string): string {
    return `${this._options.keyPrefix}${key}`;
  }

  private static _getCircularReplacer() {
    const seen = new WeakSet();
    return (_: string, value: unknown) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  }
}

export default LocalStorageService;