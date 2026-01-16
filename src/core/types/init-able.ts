/**
 * Interface for objects that need initialization
 */
export interface InitAble {
	initialize(): void | Promise<void>;
}
