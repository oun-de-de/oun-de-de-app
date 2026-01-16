import React from "react";

type AnyRepo = object;

type RepoRegistration = {
	name?: string;
	factory: () => AnyRepo;
};

export function registerProvider(factory: () => AnyRepo, instanceName?: string): RepoRegistration {
	return {
		name: instanceName,
		factory,
	};
}

type RepoStore = {
	byType: Map<string, Map<string, AnyRepo>>; // type -> (name -> instance)
};

const RepoContext = React.createContext<RepoStore | null>(null);

type MultiProviderProps = {
	providers: RepoRegistration[];
	children: React.ReactNode;
};

export function MultiProvider({ providers, children }: MultiProviderProps) {
	const [store, setStore] = React.useState<RepoStore | null>(null);

	React.useEffect(() => {
		const byType = new Map<string, Map<string, AnyRepo>>();

		for (const reg of providers) {
			const instance = reg.factory();
			const typeKey = instance.constructor.name; // 👈 lấy từ constructor.name
			const name = reg.name ?? "";

			if (!byType.has(typeKey)) {
				byType.set(typeKey, new Map());
			}

			const typeMap = byType.get(typeKey)!;

			if (!name && typeMap.size > 0) {
				throw new Error(`Multiple instances of ${typeKey} detected. Please provide instanceName.`);
			}

			if (typeMap.has(name)) {
				throw new Error(`Repo of type ${typeKey} with name "${name}" already registered`);
			}

			typeMap.set(name, instance);
		}

		setStore({ byType });
	}, [providers]);

	if (!store) return null;

	return <RepoContext.Provider value={store}>{children}</RepoContext.Provider>;
}

type Ctor<T = AnyRepo> = new (...args: any[]) => T;

export function useProvider<T extends AnyRepo>(ctor: Ctor<T>, instanceName?: string): T {
	const store = React.useContext(RepoContext);
	if (!store) {
		throw new Error("useProvider must be used inside MultiProvider");
	}

	const typeKey = ctor.name;
	const typeMap = store.byType.get(typeKey);

	if (!typeMap) {
		throw new Error(`Repo type "${typeKey}" not registered`);
	}

	if (instanceName != null) {
		const inst = typeMap.get(instanceName);
		if (!inst) {
			throw new Error(`Repo "${typeKey}" with name "${instanceName}" not found`);
		}
		return inst as T;
	}

	if (typeMap.size > 1) {
		throw new Error(`Multiple instances of ${typeKey} exist. Please specify instanceName.`);
	}

	return Array.from(typeMap.values())[0] as T;
}

export function useAllProvider<T extends AnyRepo>(ctor: Ctor<T>): T[] {
	const store = React.useContext(RepoContext);
	if (!store) {
		throw new Error("useAllProvider must be used inside MultiProvider");
	}

	const typeKey = ctor.name;
	const typeMap = store.byType.get(typeKey);

	if (!typeMap) {
		throw new Error(`Repo type "${typeKey}" not registered`);
	}

	return Array.from(typeMap.values()) as T[];
}
