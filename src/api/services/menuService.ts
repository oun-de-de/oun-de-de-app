import apiClient from "../apiClient";

import type { Menu } from "@/core/types/entity";

export enum MenuApi {
	Menu = "/menu",
}

const getMenuList = () => apiClient.get<Menu[]>({ url: MenuApi.Menu });

export default {
	getMenuList,
};
