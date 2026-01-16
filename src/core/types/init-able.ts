/**
 * Interface for objects that need initialization
 */
export interface InitAble {
	initialize(): void | Promise<void>;
}

export function isInitAble(obj: unknown): obj is InitAble {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"initialize" in (obj as any) &&
		typeof (obj as any).initialize === "function"
	);
}
