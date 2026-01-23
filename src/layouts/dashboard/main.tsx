import { LayoutMain } from "@/layouts/components/layout-main";
import { GLOBAL_CONFIG } from "@/global-config";
import { flattenTrees } from "@/core/utils/tree";
import { clone, concat } from "ramda";
import { backendNavData } from "./nav/nav-data/nav-data-backend";
import { frontendNavData } from "./nav/nav-data/nav-data-frontend";

const navData = GLOBAL_CONFIG.routerMode === "frontend" ? clone(frontendNavData) : backendNavData;
const allItems = navData.reduce((acc: any[], group) => {
	const flattenedItems = flattenTrees(group.items);
	return concat(acc, flattenedItems);
}, []);

const Main = () => {
	return <LayoutMain navData={allItems} />;
};

export default Main;
