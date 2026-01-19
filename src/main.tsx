import "./global.css";
import "./core/theme/theme.css";
import "./core/locales/i18n";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router";
import App from "./App";
import { worker } from "./_mock";
import menuService from "./core/api/services/menuService";
import { registerLocalIcons } from "./core/components/icon";
import { GLOBAL_CONFIG } from "./global-config";
import ErrorBoundary from "./routes/components/error-boundary";
import { routesSection } from "./routes/sections";

import { urlJoin } from "./core/utils";

await registerLocalIcons();
await worker.start({
	onUnhandledRequest: "bypass",
	serviceWorker: { url: urlJoin(GLOBAL_CONFIG.publicPath, "mockServiceWorker.js") },
});
if (GLOBAL_CONFIG.routerMode === "backend") {
	await menuService.getMenuList();
}

const router = createBrowserRouter(
	[
		{
			Component: () => (
				<App>
					<Outlet />
				</App>
			),
			errorElement: <ErrorBoundary />,
			children: routesSection,
		},
	],
	{
		basename: GLOBAL_CONFIG.publicPath,
	},
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
