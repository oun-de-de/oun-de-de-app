import "./global.css";
import "./core/theme/theme.css";
import "./core/locales/i18n";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
// import { worker } from "./_mock";
import App from "./App";
import { registerLocalIcons } from "./core/components/icon";
import { AppAuthService } from "./core/services/auth";
// import { urlJoin } from "./core/utils";
import { GLOBAL_CONFIG } from "./global-config";
import ErrorBoundary from "./routes/components/error-boundary";
import { routesSection } from "./routes/sections";

await registerLocalIcons();
// await worker.start({
// 	onUnhandledRequest: "bypass",
// 	serviceWorker: { url: urlJoin(GLOBAL_CONFIG.publicPath, "mockServiceWorker.js") },
// });

// Initialize auth service to restore session
await AppAuthService.getInstance().initialize();

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
