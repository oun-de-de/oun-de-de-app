import "@testing-library/jest-dom/vitest";

function createStorageMock(): Storage {
	const store = new Map<string, string>();

	return {
		get length() {
			return store.size;
		},
		clear: () => {
			store.clear();
		},
		getItem: (key: string) => store.get(key) ?? null,
		key: (index: number) => Array.from(store.keys())[index] ?? null,
		removeItem: (key: string) => {
			store.delete(key);
		},
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
	};
}

const storageMock = createStorageMock();

if (typeof window !== "undefined") {
	Object.defineProperty(window, "localStorage", {
		value: storageMock,
		writable: true,
	});
	Object.defineProperty(globalThis, "localStorage", {
		value: storageMock,
		writable: true,
	});
}

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
	Object.defineProperty(globalThis, "ResizeObserver", {
		value: ResizeObserverMock,
		writable: true,
	});
}
