import type { ReactNode } from "react";
import { MultiStoreProvider, type StoreConfig } from "@/core/ui/store/multi-store-provider";
import { settingsUiBoundStore } from "./stores/settings-ui-store";

const settingsStores: StoreConfig[] = [
	{
		name: "settings",
		store: settingsUiBoundStore,
	},
];

interface SettingsProviderProps {
	children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
	return <MultiStoreProvider stores={settingsStores}>{children}</MultiStoreProvider>;
}
