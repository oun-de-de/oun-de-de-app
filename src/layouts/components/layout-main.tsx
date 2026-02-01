import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { AuthGuard } from "@/core/components/auth";
import { LineLoading } from "@/core/components/loading/line-loading";
import { useSettings } from "@/core/store/settingStore";
import { cn } from "@/core/utils";
import Page403 from "@/pages/sys/error/Page403";

interface NavItem {
	path: string;
	auth?: string[];
}

interface LayoutMainProps {
	navData: NavItem[];
}

/**
 * Find auth by path
 */
function findAuthByPath(navData: NavItem[], path: string): string[] {
	const foundItem = navData.find((item) => item.path === path);
	return foundItem?.auth || [];
}

export function LayoutMain({ navData }: LayoutMainProps) {
	const { themeStretch } = useSettings();
	const { pathname } = useLocation();
	const currentNavAuth = findAuthByPath(navData, pathname || "");

	return (
		<AuthGuard checkAny={currentNavAuth} fallback={<Page403 />}>
			<main
				data-slot="slash-layout-main"
				className={cn(
					"flex-1 w-full flex flex-col min-h-0",
					"transition-[max-width] duration-300 ease-in-out",
					"mx-auto",
					{
						"max-w-full": themeStretch,
						"4xl:max-w-screen-4xl": !themeStretch,
					},
				)}
				style={{
					willChange: "max-width",
					padding: "14px",
				}}
			>
				<Suspense fallback={<LineLoading />}>
					<Outlet />
					<ScrollRestoration />
				</Suspense>
			</main>
		</AuthGuard>
	);
}
