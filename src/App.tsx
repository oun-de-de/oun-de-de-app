import Logo from "@/assets/icons/ic-logo-badge.svg";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { MotionLazy } from "./components/animate/motion-lazy";
import { RouteLoadingProgress } from "./components/loading";
import Toast from "./components/toast";
import { GLOBAL_CONFIG } from "./global-config";
import { AntdAdapter } from "./core/theme/adapter/antd.adapter";
import { ThemeProvider } from "./core/theme/theme-provider";
import { providers } from "./providers";
import { MultiProvider } from "./core/ui/multi-provider";

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
	return (
		<HelmetProvider>
			<QueryClientProvider client={new QueryClient()}>
				<MultiProvider providers={providers()}>
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
				</MultiProvider>
			</QueryClientProvider>
		</HelmetProvider>
	);
}

export default App;
