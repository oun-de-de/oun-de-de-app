/**
 * Service Locator / Dependency Injection Container
 * ====================================================
 *
 * Highly optimized for web performance inspired by get_it with features:
 * - Multiple registration types (factory, singleton, lazy singleton, cached factory)
 * - Scoped services with nested scopes
 * - Async initialization with ready signals
 * - WeakReference support for memory optimization
 * - Reference counting for service lifecycle
 * - Dependency resolution
 * - Auto-detection of lifecycle methods (initialize/dispose)
 * - Debug statistics and performance monitoring
 *
 * @see https://pub.dev/packages/get_it
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/** Factory function for creating services */
type FactoryFunc<T> = () => T;

/** Async factory function for creating services */
type FactoryFuncAsync<T> = () => Promise<T>;

/** Factory function with parameters */
type FactoryFuncParam<T, P1 = void, P2 = void> = (p1: P1, p2: P2) => T;

/** Async factory function with parameters */
type FactoryFuncParamAsync<T, P1 = void, P2 = void> = (p1: P1, p2: P2) => Promise<T>;

/** Function for disposing services */
type DisposingFunc<T> = (instance: T) => void | Promise<void>;

/** Function called when scope is disposed */
type ScopeDisposeFunc = () => void | Promise<void>;

/** Interface for objects that can be initialized */
interface Initializable {
	initialize(): void | Promise<void>;
}

/** Interface for objects that can be disposed */
interface Disposable {
	dispose(): void | Promise<void>;
}

/** Service factory type enum */
enum ServiceFactoryType {
	AlwaysNew = "alwaysNew",
	Constant = "constant",
	Lazy = "lazy",
	CachedFactory = "cachedFactory",
}

/** Exception for waiting timeout */
class WaitingTimeOutException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "WaitingTimeOutException";
	}
}

// ============================================================================
// Service Factory
// ============================================================================

/** Internal service factory implementation */
class ServiceFactory<T extends object = any, P1 = void, P2 = void> {
	private _type: ServiceFactoryType;
	private _creationFunction?: FactoryFunc<T>;
	private _asyncCreationFunction?: FactoryFuncAsync<T>;
	private _creationFunctionParam?: FactoryFuncParam<T, P1, P2>;
	private _asyncCreationFunctionParam?: FactoryFuncParamAsync<T, P1, P2>;
	private _disposingFunction?: DisposingFunc<T>;
	private _instance?: T;
	private _weakRef?: WeakRef<T>;
	private _isAsync: boolean;
	private _useWeakReference: boolean;
	private _instanceName?: string;
	private _readyCompleter: Promise<void>;
	private _readyResolve!: () => void;
	private _pendingResult?: Promise<T>;
	private _referenceCount = 0;
	private _shouldSignalReady: boolean;
	private _objectsWaiting: any[] = [];

	readonly registrationType: any;
	readonly registrationScope: Scope;
	readonly param1Type: any;
	readonly param2Type: any;

	constructor(config: {
		type: ServiceFactoryType;
		creationFunction?: FactoryFunc<T>;
		asyncCreationFunction?: FactoryFuncAsync<T>;
		creationFunctionParam?: FactoryFuncParam<T, P1, P2>;
		asyncCreationFunctionParam?: FactoryFuncParamAsync<T, P1, P2>;
		instance?: T;
		disposingFunction?: DisposingFunc<T>;
		instanceName?: string;
		isAsync?: boolean;
		useWeakReference?: boolean;
		shouldSignalReady?: boolean;
		registrationType: any;
		registrationScope: Scope;
		param1Type: any;
		param2Type: any;
	}) {
		this._type = config.type;
		this._creationFunction = config.creationFunction;
		this._asyncCreationFunction = config.asyncCreationFunction;
		this._creationFunctionParam = config.creationFunctionParam;
		this._asyncCreationFunctionParam = config.asyncCreationFunctionParam;
		this._instance = config.instance;
		this._disposingFunction = config.disposingFunction;
		this._instanceName = config.instanceName;
		this._isAsync = config.isAsync ?? false;
		this._useWeakReference = config.useWeakReference ?? false;
		this._shouldSignalReady = config.shouldSignalReady ?? false;

		this.registrationType = config.registrationType;
		this.registrationScope = config.registrationScope;
		this.param1Type = config.param1Type;
		this.param2Type = config.param2Type;

		let resolveReady!: () => void;
		this._readyCompleter = new Promise((resolve) => {
			resolveReady = resolve;
		});
		this._readyResolve = resolveReady;

		if (config.instance) {
			this._readyResolve();
		}
	}

	get instance(): T | undefined {
		if (this._useWeakReference && this._weakRef) {
			return this._weakRef.deref();
		}
		return this._instance;
	}

	get isReady(): boolean {
		return this._readyCompleter === undefined || (this._readyCompleter as any).settled;
	}

	get isAsync(): boolean {
		return this._isAsync;
	}

	get debugName(): string {
		return `${this._instanceName || "default"} : ${this.registrationType?.name || "Unknown"}`;
	}

	get canBeWaitedFor(): boolean {
		return this._shouldSignalReady || !!this._pendingResult || this._isAsync;
	}

	get shouldSignalReady(): boolean {
		return this._shouldSignalReady;
	}

	getObject(param1?: P1, param2?: P2): T {
		if (this._type === ServiceFactoryType.Constant || this._type === ServiceFactoryType.Lazy) {
			if (this.instance) return this.instance;

			let service: T;
			if (this._creationFunctionParam) {
				service = this._creationFunctionParam(param1 as P1, param2 as P2);
			} else if (this._creationFunction) {
				service = this._creationFunction();
			} else {
				throw new Error(`[ServiceLocator] No creation function for ${this.debugName}`);
			}

			this._storeInstance(service);
			this._initializeIfNeeded(service);
			return service;
		} else if (this._type === ServiceFactoryType.CachedFactory) {
			// const cacheKey = `${String(param1)}:${String(param2)}`;
			if (this.instance) return this.instance;

			let service: T;
			if (this._creationFunctionParam) {
				service = this._creationFunctionParam(param1 as P1, param2 as P2);
			} else if (this._creationFunction) {
				service = this._creationFunction();
			} else {
				throw new Error(`[ServiceLocator] No creation function for ${this.debugName}`);
			}

			this._storeInstance(service);
			this._initializeIfNeeded(service);
			return service;
		} else if (this._type === ServiceFactoryType.AlwaysNew) {
			let service: T;
			if (this._creationFunctionParam) {
				service = this._creationFunctionParam(param1 as P1, param2 as P2);
			} else if (this._creationFunction) {
				service = this._creationFunction();
			} else {
				throw new Error(`[ServiceLocator] No creation function for ${this.debugName}`);
			}

			this._initializeIfNeeded(service);
			return service;
		}

		throw new Error(`[ServiceLocator] Unknown factory type for ${this.debugName}`);
	}

	async getObjectAsync(param1?: P1, param2?: P2): Promise<T> {
		if (this._type === ServiceFactoryType.Constant || this._type === ServiceFactoryType.Lazy) {
			if (this.instance) return this.instance;

			if (this._pendingResult) return this._pendingResult;

			let promise: Promise<T>;
			if (this._asyncCreationFunctionParam) {
				promise = this._asyncCreationFunctionParam(param1 as P1, param2 as P2);
			} else if (this._asyncCreationFunction) {
				promise = this._asyncCreationFunction();
			} else if (this._creationFunctionParam) {
				promise = Promise.resolve(this._creationFunctionParam(param1 as P1, param2 as P2));
			} else if (this._creationFunction) {
				promise = Promise.resolve(this._creationFunction());
			} else {
				throw new Error(`[ServiceLocator] No creation function for ${this.debugName}`);
			}

			this._pendingResult = promise;

			const service = await promise;
			this._storeInstance(service);
			await this._initializeIfNeededAsync(service);
			this._readyResolve();
			return service;
		}

		throw new Error(`[ServiceLocator] Async not supported for factory type ${this._type}`);
	}

	private _storeInstance(service: T): void {
		if (this._useWeakReference) {
			this._weakRef = new WeakRef(service);
		} else {
			this._instance = service;
		}
	}

	private _initializeIfNeeded(service: T): void {
		if (this._isInitAble(service)) {
			const result = service.initialize();
			if (result instanceof Promise) {
				result.catch((error) => {
					console.error(`[ServiceLocator] Initialization failed for ${this.debugName}:`, error);
				});
			}
		}
	}

	private async _initializeIfNeededAsync(service: T): Promise<void> {
		if (this._isInitAble(service)) {
			const result = service.initialize();
			if (result instanceof Promise) {
				await result;
			}
		}
	}

	async dispose(): Promise<void> {
		if (this.instance && this._isDisposeAble(this.instance)) {
			if (this._disposingFunction) {
				const result = this._disposingFunction(this.instance);
				if (result instanceof Promise) {
					await result;
				}
			} else if (this._isDisposeAble(this.instance)) {
				const result = this.instance.dispose();
				if (result instanceof Promise) {
					await result;
				}
			}
		}

		this._instance = undefined;
		this._weakRef = undefined;
		this._pendingResult = undefined;
	}

	private _isInitAble(obj: unknown): obj is Initializable {
		return (
			typeof obj === "object" && obj !== null && "initialize" in obj && typeof (obj as any).initialize === "function"
		);
	}

	private _isDisposeAble(obj: unknown): obj is Disposable {
		return typeof obj === "object" && obj !== null && "dispose" in obj && typeof (obj as any).dispose === "function";
	}

	resetInstance(): void {
		if (this._useWeakReference) {
			this._weakRef = undefined;
		} else {
			this._instance = undefined;
		}
	}

	signalReady(): void {
		this._readyResolve();
	}

	incrementReferenceCount(): void {
		this._referenceCount++;
	}

	decrementReferenceCount(): boolean {
		this._referenceCount--;
		return this._referenceCount <= 0;
	}

	get referenceCount(): number {
		return this._referenceCount;
	}

	get objectsWaiting(): any[] {
		return this._objectsWaiting;
	}

	addObjectWaiting(type: any): void {
		if (!this._objectsWaiting.includes(type)) {
			this._objectsWaiting.push(type);
		}
	}

	removeObjectWaiting(type: any): void {
		this._objectsWaiting = this._objectsWaiting.filter((t) => t !== type);
	}

	setInstanceName(name: string): void {
		this._instanceName = name;
	}

	get instanceName(): string | undefined {
		return this._instanceName;
	}
}

// ============================================================================
// Type Registration
// ============================================================================

/** Type registration holder */
class TypeRegistration<T extends object = any> {
	private _factories: ServiceFactory<T>[] = [];
	private _namedFactories = new Map<string, ServiceFactory<T>>();

	addFactory(factory: ServiceFactory<T>, name?: string): void {
		if (name) {
			this._namedFactories.set(name, factory);
		} else {
			this._factories.push(factory);
		}
	}

	getFactory(name?: string): ServiceFactory<T> | undefined {
		if (name) {
			return this._namedFactories.get(name);
		}
		return this._factories[0];
	}

	getFactoryByName<U extends object = T>(instanceName: string): ServiceFactory<U> | undefined {
		return this._namedFactories.get(instanceName) as ServiceFactory<U> | undefined;
	}

	getAll(): ServiceFactory<T>[] {
		return [...this._factories, ...this._namedFactories.values()];
	}

	async dispose(): Promise<void> {
		const promises: Promise<void>[] = [];

		for (const factory of this._factories.reverse()) {
			promises.push(factory.dispose());
		}

		for (const factory of Array.from(this._namedFactories.values()).reverse()) {
			promises.push(factory.dispose());
		}

		await Promise.all(promises);

		this._factories = [];
		this._namedFactories.clear();
	}

	get isEmpty(): boolean {
		return this._factories.length === 0 && this._namedFactories.size === 0;
	}
}

// ============================================================================
// Scope
// ============================================================================

/** Scope for managing service lifecycle */
class Scope {
	private _name?: string;
	private _disposeFunc?: ScopeDisposeFunc;
	private _typeRegistrations = new Map<any, TypeRegistration>();
	private _isFinal = false;
	private _isPopping = false;

	constructor(config?: { name?: string; disposeFunc?: ScopeDisposeFunc }) {
		this._name = config?.name;
		this._disposeFunc = config?.disposeFunc;
	}

	get name(): string | undefined {
		return this._name;
	}

	get isFinal(): boolean {
		return this._isFinal;
	}

	getRegistration<T extends object>(type: any): TypeRegistration<T> {
		if (this._isFinal) {
			throw new Error(`[ServiceLocator] Cannot register in final scope: ${this._name}`);
		}
		if (!this._typeRegistrations.has(type)) {
			this._typeRegistrations.set(type, new TypeRegistration<T>());
		}
		return this._typeRegistrations.get(type)!;
	}

	getFactoryByName<T extends object = any>(instanceName: string): ServiceFactory<T> | undefined {
		for (const registration of this._typeRegistrations.values()) {
			const factory = registration.getFactoryByName<T>(instanceName);
			if (factory) {
				return factory;
			}
		}
		return undefined;
	}

	async dispose(): Promise<void> {
		// Dispose all registrations in reverse order
		const types = Array.from(this._typeRegistrations.keys()).reverse();
		const promises: Promise<void>[] = [];

		for (const type of types) {
			const registration = this._typeRegistrations.get(type);
			if (registration) {
				promises.push(registration.dispose());
			}
		}

		await Promise.all(promises);

		// Call scope dispose function
		if (this._disposeFunc) {
			const result = this._disposeFunc();
			if (result instanceof Promise) {
				await result;
			}
		}

		this._typeRegistrations.clear();
	}

	markAsPopping(): void {
		this._isPopping = true;
	}

	markAsFinal(): void {
		this._isFinal = true;
	}

	isPopping(): boolean {
		return this._isPopping;
	}

	async reset(dispose: boolean = true): Promise<void> {
		if (dispose) {
			await this.dispose();
		}
		this._typeRegistrations.clear();
	}
}

// ============================================================================
// Service Locator (Main Container)
// ============================================================================

/**
 * Service Locator / Dependency Injection Container
 *
 * @example
 * ```typescript
 * const locator = GetIt.instance;
 *
 * // Register singleton
 * locator.registerSingleton<UserService>(new UserServiceImpl());
 *
 * // Register lazy singleton
 * locator.registerLazySingleton<UserService>(() => new UserServiceImpl());
 *
 * // Register factory (always new)
 * locator.registerFactory<UserService>(() => new UserServiceImpl());
 *
 * // Get service
 * const userService = locator.get<UserService>();
 *
 * // Get async
 * const service = await locator.getAsync<UserService>();
 *
 * // Reset
 * await locator.reset();
 * ```
 */
class GetIt {
	private static _instance: GetIt | null = null;
	private static _pushScopeInProgress = false;
	private _scopes: Scope[] = [];
	private _globalReadyCompleter: Promise<void>;
	private _globalReadyResolve!: () => void;

	private constructor() {
		let resolve!: () => void;
		this._globalReadyCompleter = new Promise((r) => {
			resolve = r;
		});
		this._globalReadyResolve = resolve;

		this._scopes.push(new Scope({ name: "baseScope" }));
	}

	/**
	 * Get singleton instance
	 */
	static get instance(): GetIt {
		if (!GetIt._instance) {
			GetIt._instance = new GetIt();
		}
		return GetIt._instance;
	}

	// ========== Registration Methods ==========

	/**
	 * Register a singleton instance
	 */
	registerSingleton<T extends object>(
		instance: T,
		config?: { instanceName?: string; dispose?: DisposingFunc<T>; signalsReady?: boolean },
	): T {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;
		const type = instance.constructor;

		const factory = new ServiceFactory<T>({
			type: ServiceFactoryType.Constant,
			instance,
			disposingFunction: config?.dispose,
			instanceName,
			shouldSignalReady: config?.signalsReady ?? false,
			registrationType: type,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		const registration = scope.getRegistration<T>(type);
		registration.addFactory(factory, instanceName);

		this._initializeIfNeeded(instance);

		return instance;
	}

	/**
	 * Register a lazy singleton
	 */
	registerLazySingleton<T extends object>(
		factory: FactoryFunc<T>,
		config?: { instanceName?: string; dispose?: DisposingFunc<T>; registrationType?: any },
	): void {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;
		const registrationType = config?.registrationType || factory.constructor;

		const serviceFactory = new ServiceFactory<T>({
			type: ServiceFactoryType.Lazy,
			creationFunction: factory,
			disposingFunction: config?.dispose,
			instanceName,
			shouldSignalReady: false,
			registrationType: registrationType,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		const registration = scope.getRegistration<T>(registrationType);
		registration.addFactory(serviceFactory, instanceName);
	}

	/**
	 * Register a factory (always new instance)
	 */
	registerFactory<T extends object>(factory: FactoryFunc<T>, config?: { instanceName?: string }): void {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;

		const serviceFactory = new ServiceFactory<T>({
			type: ServiceFactoryType.AlwaysNew,
			creationFunction: factory,
			instanceName,
			shouldSignalReady: false,
			registrationType: factory.constructor,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		const registration = scope.getRegistration<T>(factory.constructor);
		registration.addFactory(serviceFactory, instanceName);
	}

	/**
	 * Register a cached factory
	 */
	registerCachedFactory<T extends object>(
		factory: FactoryFunc<T>,
		config?: { instanceName?: string; dispose?: DisposingFunc<T> },
	): void {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;

		const serviceFactory = new ServiceFactory<T>({
			type: ServiceFactoryType.CachedFactory,
			creationFunction: factory,
			disposingFunction: config?.dispose,
			instanceName,
			shouldSignalReady: false,
			registrationType: factory.constructor,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		const registration = scope.getRegistration<T>(factory.constructor);
		registration.addFactory(serviceFactory, instanceName);
	}

	/**
	 * Register async singleton
	 */
	registerSingletonAsync<T extends object>(
		factory: FactoryFuncAsync<T>,
		config?: { instanceName?: string; dispose?: DisposingFunc<T>; signalsReady?: boolean },
	): void {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;

		const serviceFactory = new ServiceFactory<T>({
			type: ServiceFactoryType.Constant,
			asyncCreationFunction: factory,
			disposingFunction: config?.dispose,
			instanceName,
			isAsync: true,
			shouldSignalReady: config?.signalsReady ?? false,
			registrationType: factory.constructor,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		const registration = scope.getRegistration<T>(factory.constructor);
		registration.addFactory(serviceFactory, instanceName);

		// Start initialization
		serviceFactory.getObjectAsync().catch((error) => {
			console.error(`[ServiceLocator] Async initialization failed:`, error);
		});
	}

	/**
	 * Register singleton only if not already registered
	 * Increments reference counter if already exists
	 * Decrements counter with releaseInstance() for auto-unregister at 0
	 */
	registerSingletonIfAbsent<T extends object>(
		factory: FactoryFunc<T>,
		config?: { instanceName?: string; dispose?: DisposingFunc<T> },
	): T {
		const instanceName = config?.instanceName;
		const scope = this._currentScope;
		const type = factory.constructor;

		const registration = scope.getRegistration<T>(type);
		const existingFactory = registration.getFactory(instanceName);

		if (existingFactory && existingFactory.instance) {
			// Already registered, increment reference counter
			existingFactory.incrementReferenceCount();
			return existingFactory.instance;
		}

		// Not registered, create new singleton
		const instance = factory();
		const serviceFactory = new ServiceFactory<T>({
			type: ServiceFactoryType.Constant,
			instance,
			disposingFunction: config?.dispose,
			instanceName,
			shouldSignalReady: false,
			registrationType: type,
			registrationScope: scope,
			param1Type: void 0,
			param2Type: void 0,
		});

		// Initialize reference count to 1
		serviceFactory.incrementReferenceCount();

		registration.addFactory(serviceFactory, instanceName);
		this._initializeIfNeeded(instance);

		return instance;
	}

	// ========== Retrieval Methods ==========

	/**
	 * Get service instance
	 */
	get<T extends object>(config?: { type?: any; instanceName?: string; param1?: any; param2?: any }): T {
		const type = config?.type || (this._getTypeFromGeneric?.() as any);
		const instanceName = config?.instanceName;

		if (!type) {
			throw new Error("[ServiceLocator] Type is required. Either pass type in config or use get<T>()");
		}

		const scope = this._currentScope;
		const registration = scope.getRegistration<T>(type);
		const factory = registration.getFactory(instanceName);

		if (!factory) {
			throw new Error(
				`[ServiceLocator] Service not registered: ${type.name}${instanceName ? ` (${instanceName})` : ""}`,
			);
		}

		return factory.getObject(config?.param1, config?.param2);
	}

	/**
	 * Get service or null if not registered
	 */
	getOrNull<T extends object>(config?: { type?: any; instanceName?: string }): T | null {
		try {
			return this.get<T>(config);
		} catch {
			return null;
		}
	}

	/**
	 * Get all instances of a type
	 */
	getAll<T extends object>(config?: { type?: any; fromAllScopes?: boolean }): T[] {
		const type = config?.type || (this._getTypeFromGeneric?.() as any);

		if (!type) {
			throw new Error("[ServiceLocator] Type is required");
		}

		const scopes = config?.fromAllScopes ? this._scopes : [this._currentScope];
		const instances: T[] = [];

		for (const scope of scopes) {
			const registration = scope.getRegistration<T>(type);
			const factories = registration.getAll();

			for (const factory of factories) {
				const instance = factory.instance;
				if (instance) {
					instances.push(instance);
				}
			}
		}

		return instances;
	}

	/**
	 * Get async service
	 */
	async getAsync<T extends object>(config?: { type?: any; instanceName?: string }): Promise<T> {
		const type = config?.type || (this._getTypeFromGeneric?.() as any);
		const instanceName = config?.instanceName;

		if (!type) {
			throw new Error("[ServiceLocator] Type is required");
		}

		const scope = this._currentScope;
		const registration = scope.getRegistration<T>(type);
		const factory = registration.getFactory(instanceName);

		if (!factory) {
			throw new Error(
				`[ServiceLocator] Service not registered: ${type.name}${instanceName ? ` (${instanceName})` : ""}`,
			);
		}

		return factory.getObjectAsync();
	}

	/**
	 * Check if service is registered
	 */
	isRegistered<T extends object>(config?: { type?: any; instanceName?: string }): boolean {
		const type = config?.type;
		if (!type) return false;

		const scope = this._currentScope;
		const registration = scope.getRegistration<T>(type);
		return registration.getFactory(config?.instanceName) !== undefined;
	}

	// ========== Lifecycle Methods ==========

	/**
	 * Signal that service is ready
	 */
	signalReady<T extends object>(instance?: T): void {
		if (!instance) {
			this._globalReadyResolve();
			return;
		}

		// Find factory by instance and signal ready
		const scopes = this._scopes;
		for (const scope of scopes) {
			// Search through all type registrations
			for (const registration of (scope as any)._typeRegistrations.values()) {
				for (const factory of registration.getAll()) {
					if (factory.instance === instance) {
						factory.signalReady();
						return;
					}
				}
			}
		}
	}

	/**
	 * Wait for all services to be ready
	 */
	async allReady(config?: { timeout?: number }): Promise<void> {
		const timeout = config?.timeout;

		if (timeout) {
			return Promise.race<void>([
				this._globalReadyCompleter,
				new Promise<void>((_, reject) =>
					setTimeout(() => reject(new WaitingTimeOutException("[ServiceLocator] allReady timeout")), timeout),
				),
			]);
		}

		return this._globalReadyCompleter;
	}

	/**
	 * Check if all services are ready without waiting
	 */
	allReadySync(): boolean {
		return (this._globalReadyCompleter as any).settled ?? false;
	}

	/**
	 * Unregister a service
	 */
	async unregister<T extends object>(config?: { type?: any; instanceName?: string }): Promise<void> {
		const type = config?.type;
		if (!type) return;

		const scope = this._currentScope;
		const registration = scope.getRegistration<T>(type);
		const factory = registration.getFactory(config?.instanceName);

		if (factory) {
			await factory.dispose();
		}
	}

	/**
	 * Release an instance and decrement reference counter
	 * Only disposes when reference counter reaches 0
	 * Used with registerSingletonIfAbsent for ref counting
	 */
	async releaseInstance<T extends object>(instance: T): Promise<void> {
		const scopes = this._scopes;

		for (const scope of scopes) {
			for (const registration of (scope as any)._typeRegistrations.values()) {
				for (const factory of registration.getAll()) {
					if (factory.instance === instance) {
						const shouldDispose = factory.decrementReferenceCount();

						if (shouldDispose) {
							await factory.dispose();
						}

						return;
					}
				}
			}
		}
	}

	/**
	 * Reset all services
	 */
	async reset(config?: { dispose?: boolean }): Promise<void> {
		const shouldDispose = config?.dispose !== false;

		for (const scope of this._scopes.reverse()) {
			await scope.dispose();
		}

		this._scopes = [new Scope({ name: "baseScope" })];

		if (shouldDispose) {
			let resolve!: () => void;
			this._globalReadyCompleter = new Promise((r) => {
				resolve = r;
			});
			this._globalReadyResolve = resolve;
		}
	}

	/**
	 * Create a new scope
	 */
	pushNewScope(config?: {
		name?: string;
		disposeFunc?: ScopeDisposeFunc;
		isFinal?: boolean;
		init?: (locator: GetIt) => void;
	}): void {
		if (GetIt._pushScopeInProgress) {
			throw new Error("[ServiceLocator] You cannot push a new scope inside the init function of another scope");
		}

		if (config?.name === "baseScope") {
			throw new Error("[ServiceLocator] 'baseScope' is a reserved scope name");
		}

		if (config?.name && this._scopes.some((s) => s.name === config.name)) {
			throw new Error(`[ServiceLocator] Scope with name '${config.name}' already exists`);
		}

		GetIt._pushScopeInProgress = true;
		try {
			const scope = new Scope(config);
			if (config?.isFinal) {
				scope.markAsFinal();
			}
			this._scopes.push(scope);

			if (config?.init) {
				config.init(this);
			}
		} catch (error) {
			const failedScope = this._scopes.pop();
			if (failedScope) {
				failedScope.markAsFinal();
			}
			throw error;
		} finally {
			GetIt._pushScopeInProgress = false;
		}
	}

	/**
	 * Create a new scope with async init
	 */
	async pushNewScopeAsync(config?: {
		name?: string;
		disposeFunc?: ScopeDisposeFunc;
		isFinal?: boolean;
		init?: (locator: GetIt) => Promise<void>;
	}): Promise<void> {
		if (GetIt._pushScopeInProgress) {
			throw new Error("[ServiceLocator] You cannot push a new scope inside the init function of another scope");
		}

		if (config?.name === "baseScope") {
			throw new Error("[ServiceLocator] 'baseScope' is a reserved scope name");
		}

		if (config?.name && this._scopes.some((s) => s.name === config.name)) {
			throw new Error(`[ServiceLocator] Scope with name '${config.name}' already exists`);
		}

		GetIt._pushScopeInProgress = true;
		try {
			const scope = new Scope(config);
			if (config?.isFinal) {
				scope.markAsFinal();
			}
			this._scopes.push(scope);

			if (config?.init) {
				await config.init(this);
			}
		} catch (error) {
			const failedScope = this._scopes.pop();
			if (failedScope) {
				failedScope.markAsFinal();
				await failedScope.reset(true);
			}
			throw error;
		} finally {
			GetIt._pushScopeInProgress = false;
		}
	}

	/**
	 * Remove current scope
	 */
	async popScope(): Promise<void> {
		if (GetIt._pushScopeInProgress) {
			throw new Error("[ServiceLocator] You cannot pop a scope inside the init function of another scope");
		}
		if (this._scopes.length <= 1) {
			throw new Error("[ServiceLocator] Cannot pop base scope");
		}

		const scope = this._scopes.pop()!;
		scope.markAsPopping();
		await scope.dispose();
	}

	/**
	 * Pop scopes until the one with the given name is on top
	 */
	async popScopesTill(scopeName: string): Promise<void> {
		if (GetIt._pushScopeInProgress) {
			throw new Error("[ServiceLocator] You cannot pop scopes inside the init function of another scope");
		}

		const targetIndex = this._scopes.findIndex((s) => s.name === scopeName);
		if (targetIndex === -1) {
			throw new Error(`[ServiceLocator] Scope with name '${scopeName}' not found`);
		}
		if (targetIndex === 0) {
			throw new Error("[ServiceLocator] Cannot pop to base scope");
		}

		while (this._scopes.length > targetIndex + 1) {
			const scope = this._scopes.pop()!;
			scope.markAsPopping();
			await scope.dispose();
		}
	}

	/**
	 * Drop a scope without removing it from stack
	 */
	async dropScope(scopeName: string): Promise<void> {
		if (GetIt._pushScopeInProgress) {
			throw new Error("[ServiceLocator] You cannot drop a scope inside the init function of another scope");
		}

		const scope = this._scopes.find((s) => s.name === scopeName);
		if (!scope) {
			throw new Error(`[ServiceLocator] Scope with name '${scopeName}' not found`);
		}
		if (scope === this._scopes[0]) {
			throw new Error("[ServiceLocator] Cannot drop base scope");
		}

		scope.markAsPopping();
		await scope.dispose();
	}

	/**
	 * Check if a scope with the given name exists
	 */
	hasScope(scopeName: string): boolean {
		return this._scopes.some((s) => s.name === scopeName);
	}

	/**
	 * Get scope by name
	 */
	getScope(scopeName: string): Scope | undefined {
		return this._scopes.find((s) => s.name === scopeName);
	}

	/**
	 * Change the instance name for a type
	 */
	changeTypeInstanceName<T extends object = any>(from: string, to: string): void {
		for (const scope of this._scopes) {
			const factory = scope.getFactoryByName<T>(from);
			if (factory) {
				factory.setInstanceName(to);
				return;
			}
		}

		throw new Error(`[ServiceLocator] No instance named '${from}' found for type`);
	}

	// ========== Utilities ==========

	/**
	 * Get debug statistics
	 */
	getStats(): { scopes: number; registrations: number } {
		let registrations = 0;

		for (const scope of this._scopes) {
			const typeRegs = (scope as any)._typeRegistrations;
			registrations += typeRegs.size;
		}

		return {
			scopes: this._scopes.length,
			registrations,
		};
	}

	private get _currentScope(): Scope {
		return this._scopes[this._scopes.length - 1];
	}

	private _initializeIfNeeded(service: object): void {
		if (this._isInitAble(service)) {
			const result = service.initialize();
			if (result instanceof Promise) {
				result.catch((error) => {
					console.error(`[ServiceLocator] Initialization failed:`, error);
				});
			}
		}
	}

	private _isInitAble(obj: unknown): obj is Initializable {
		return (
			typeof obj === "object" && obj !== null && "initialize" in obj && typeof (obj as any).initialize === "function"
		);
	}

	private _getTypeFromGeneric(): any {
		// This is a workaround for TypeScript generic type extraction
		return undefined;
	}
}

export { GetIt, ServiceFactory, Scope, ServiceFactoryType, WaitingTimeOutException };
