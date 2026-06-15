/* eslint-disable no-unused-vars */
import type { StorageOptions } from "@/core/types/storage-options";
import { debugLogger } from "@/core/utils/logger";

export class LocalStorageService {
	private static _options: Required<StorageOptions> = {
		storage: "localStorage",
		keyPrefix: "app:",
		serialize: (data) => JSON.stringify(data, this._getCircularReplacer()),
		deserialize: (raw) => JSON.parse(raw),
	};

	static configure(options?: StorageOptions): void {
		LocalStorageService._options = { ...LocalStorageService._options, ...options };
	}

	// ---------------- Public API ----------------

	static save(key: string, data: unknown): boolean {
		try {
			const storage = LocalStorageService._storage();
			storage.setItem(LocalStorageService._key(key), LocalStorageService._options.serialize(data));
			return true;
		} catch (e) {
			debugLogger.warn(`[LocalStorageService] save failed: ${key}`, e);
			return false;
		}
	}

	static load<T>(key: string, defaultValue: T): T {
		try {
			const storage = LocalStorageService._storage();
			const raw = storage.getItem(LocalStorageService._key(key));
			if (!raw) return defaultValue;
			return LocalStorageService._options.deserialize(raw) as T;
		} catch (e) {
			debugLogger.warn(`[LocalStorageService] load failed: ${key}`, e);
			return defaultValue;
		}
	}

	static loadOrNull<T>(key: string): T | null {
		try {
			const storage = LocalStorageService._storage();
			const raw = storage.getItem(LocalStorageService._key(key));
			if (!raw) return null;
			return LocalStorageService._options.deserialize(raw) as T;
		} catch (e) {
			debugLogger.warn(`[LocalStorageService] loadOrNull failed: ${key}`, e);
			return null;
		}
	}

	static remove(key: string): void {
		try {
			LocalStorageService._storage().removeItem(LocalStorageService._key(key));
		} catch (e) {
			debugLogger.warn(`[LocalStorageService] remove failed: ${key}`, e);
		}
	}

	static clear(): void {
		try {
			const storage = LocalStorageService._storage();
			const prefix = LocalStorageService._options.keyPrefix;

			for (let i = storage.length - 1; i >= 0; i--) {
				const k = storage.key(i);
				if (k && k.startsWith(prefix)) {
					storage.removeItem(k);
				}
			}
		} catch (e) {
			debugLogger.warn("[LocalStorageService] clear failed", e);
		}
	}

	static isAvailable(): boolean {
		try {
			const s = LocalStorageService._storage();
			const t = "__ls_test__";
			s.setItem(t, t);
			s.removeItem(t);
			return true;
		} catch (e) {
			debugLogger.warn("[LocalStorageService] isAvailable failed", e);
			return false;
		}
	}

	static getSize(): number {
		try {
			const storage = LocalStorageService._storage();
			let size = 0;

			for (let i = 0; i < storage.length; i++) {
				const k = storage.key(i);
				if (!k) continue;
				const v = storage.getItem(k);
				if (v) size += k.length + v.length;
			}

			return size;
		} catch (e) {
			debugLogger.warn("[LocalStorageService] getSize failed", e);
			return 0;
		}
	}

	static getKeys(): string[] {
		try {
			const storage = LocalStorageService._storage();
			const prefix = LocalStorageService._options.keyPrefix;
			const keys: string[] = [];

			for (let i = 0; i < storage.length; i++) {
				const k = storage.key(i);
				if (k && k.startsWith(prefix)) {
					keys.push(k.slice(prefix.length));
				}
			}

			return keys;
		} catch (e) {
			debugLogger.warn("[LocalStorageService] getKeys failed", e);
			return [];
		}
	}

	// ---------------- Internals ----------------

	private static _storage(): Storage {
		if (typeof window === "undefined") {
			throw new TypeError("Storage is only available in browser");
		}

		return LocalStorageService._options.storage === "sessionStorage" ? window.sessionStorage : window.localStorage;
	}

	private static _key(key: string): string {
		return `${LocalStorageService._options.keyPrefix}${key}`;
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
