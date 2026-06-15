import type { StorageEnum } from "@/core/types/enum";

/**
 * Wrapper around localStorage with silent try-catch on every operation.
 *
 * WHY: Safari private browsing throws SecurityError on ANY localStorage access.
 * Storage quota exhaustion throws QuotaExceededError. Without try-catch, the
 * entire app crashes — even for non-critical reads during render.
 *
 * Trade-off: errors are logged but swallowed. localStorage is non-critical here
 * (theme/settings preferences) — acceptable loss vs a white screen.
 */

export const getItem = <T>(key: StorageEnum): T | null => {
	let value = null;
	try {
		const result = window.localStorage.getItem(key);
		if (result) {
			value = JSON.parse(result);
		}
	} catch (_error) {
		console.warn("[storage] getItem failed:", _error);
	}
	return value;
};

export const getStringItem = (key: StorageEnum): string | null => {
	try {
		return window.localStorage.getItem(key);
	} catch (_error) {
		console.warn("[storage] getStringItem failed:", _error);
		return null;
	}
};

export const setItem = <T>(key: StorageEnum, value: T): void => {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (_error) {
		console.warn("[storage] setItem failed:", _error);
	}
};

export const removeItem = (key: StorageEnum): void => {
	try {
		window.localStorage.removeItem(key);
	} catch (_error) {
		console.warn("[storage] removeItem failed:", _error);
	}
};

export const clearItems = () => {
	try {
		window.localStorage.clear();
	} catch (_error) {
		console.warn("[storage] clearItems failed:", _error);
	}
};
