import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Logo from "@/assets/icons/ic-logo-badge.svg";
import { MotionLazy } from "./core/components/animate/motion-lazy";
import { RouteLoadingProgress } from "./core/components/loading";
import Toast from "./core/components/toast";
import { AntdAdapter } from "./core/theme/adapter/antd.adapter";
import { ThemeProvider } from "./core/theme/theme-provider";
import { GLOBAL_CONFIG } from "./global-config";
import Repository from "./service-locator";

if (import.meta.env.DEV) {
	import("react-scan").then(({ scan }) => {
		scan({
			enabled: false,
			showToolbar: true,
			log: false,
			animationSpeed: "fast",
		});
	});
}

function App({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		Repository.initialize();
	}, []);
	return (
		<HelmetProvider>
			<QueryClientProvider client={new QueryClient()}>
				<ThemeProvider adapters={[AntdAdapter]}>
					<VercelAnalytics debug={import.meta.env.PROD} />
					<Helmet>
						<title>{GLOBAL_CONFIG.appName}</title>
						<link rel="icon" href={Logo} />
					</Helmet>
					<Toast />
					<RouteLoadingProgress />
					<MotionLazy>{children}</MotionLazy>
				</ThemeProvider>
			</QueryClientProvider>
		</HelmetProvider>
	);
}

export default App;
