import type { ReactNode } from "react";
import { MultiStoreProvider, type StoreConfig } from "@/core/ui/store/multi-store-provider";
import { settingsBoundStore } from "./stores/settings-store";

const settingsStores: StoreConfig[] = [
	{
		name: "settings",
		store: settingsBoundStore,
	},
];

interface SettingsProviderProps {
	children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
	return <MultiStoreProvider stores={settingsStores}>{children}</MultiStoreProvider>;
}
