import React from "react";

type AnyRepo = object;

type RepoRegistration<T extends AnyRepo = AnyRepo> = {
  type: Function;
  name?: string;
  factory: () => T;
};

export function registerProvider<T extends AnyRepo>(
  factory: () => T,
  instanceName?: string,
): RepoRegistration<T> {
  return {
    type: null as unknown as Function,
    name: instanceName,
    factory,
  };
}

type RepoStore = {
  byType: Map<Function, Map<string, AnyRepo>>; // type -> (name -> instance)
};

const RepoContext = React.createContext<RepoStore | null>(null);

type MultiProviderProps = {
  providers: RepoRegistration[];
  children: React.ReactNode;
};

export function MultiProvider({ providers: repos, children }: MultiProviderProps) {
  const [store, setStore] = React.useState<RepoStore | null>(null);

  React.useEffect(() => {
    const byType = new Map<Function, Map<string, AnyRepo>>();

    for (const reg of repos) {
      const instance = reg.factory();
      const type = instance.constructor;
      const name = reg.name ?? "";

      if (!name && byType.has(type)) {
        throw new Error(
          `Multiple instances of ${type.name} detected. Please provide instanceName.`,
        );
      }

      if (!byType.has(type)) {
        byType.set(type, new Map());
      }

      const typeMap = byType.get(type)!;

      if (typeMap.has(name)) {
        throw new Error(
          `Repo of type ${type.name} with name "${name}" already registered`,
        );
      }

      typeMap.set(name, instance);
    }

    setStore({ byType });
  }, [repos]);

  if (!store) return null;

  return (
    <RepoContext.Provider value={store}>
      {children}
    </RepoContext.Provider>
  );
}

export function useProvider<T extends AnyRepo>(instanceName?: string): T {
  const store = React.useContext(RepoContext);
  if (!store) {
    throw new Error("useProvider must be used inside MultiProvider");
  }

  const matches: AnyRepo[] = [];

  for (const [, map] of store.byType) {
    if (instanceName != null) {
      const inst = map.get(instanceName);
      if (inst) matches.push(inst);
    } else {
      for (const [, inst] of map) {
        matches.push(inst);
      }
    }
  }

  if (matches.length === 0) {
    throw new Error(
      instanceName
        ? `Repo "${instanceName}" not found`
        : "No repo registered",
    );
  }

  if (matches.length > 1) {
    throw new Error(
      "Multiple repo instances exist. Please specify instanceName.",
    );
  }

  return matches[0] as T;
}

export function useAllProvider<T extends AnyRepo>(): T[] {
  const store = React.useContext(RepoContext);
  if (!store) {
    throw new Error("useAllProvider must be used inside MultiProvider");
  }

  const result: T[] = [];
  for (const [, map] of store.byType) {
    for (const [, inst] of map) {
      result.push(inst as T);
    }
  }
  return result;
}