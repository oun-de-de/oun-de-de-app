import { Icon } from "@/components/icon";
import { useFilteredNavData } from "@/layouts/dashboard/nav/nav-data/index";
import { RouterLink } from "@/routes/components/router-link";
import { useLocation, useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ScrollArea } from "@/core/ui/scroll-area";

type HistoryItem = {
	path: string;
	title: string;
};

const DEFAULT_DASHBOARD_PATH = "/";
const DEFAULT_DASHBOARD_TITLE = "Dashboard";

export default function NavHistoryMenu() {
	const location = useLocation();
	const navigate = useNavigate();
	const navData = useFilteredNavData();
	const [history, setHistory] = useState<HistoryItem[]>(() => {
		// Initialize with Dashboard
		const saved = localStorage.getItem("nav-history");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// Ensure Dashboard is always first
				if (parsed.length > 0 && parsed[0].path !== DEFAULT_DASHBOARD_PATH) {
					return [{ path: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }, ...parsed];
				}
				return parsed;
			} catch {
				return [{ path: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }];
			}
		}
		return [{ path: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }];
	});

	// Create path to title mapping from nav data
	const pathToTitleMap = useMemo(() => {
		const map = new Map<string, string>();
		map.set(DEFAULT_DASHBOARD_PATH, DEFAULT_DASHBOARD_TITLE);

		const flattenNavItems = (items: any[]) => {
			items.forEach((item) => {
				if (item.path) {
					map.set(item.path, item.title);
				}
				if (item.children) {
					flattenNavItems(item.children);
				}
			});
		};

		navData.forEach((group) => {
			flattenNavItems(group.items);
		});

		// Add specific route mappings from frontend routes
		map.set("/dashboard/sale/new", "Create Sale");
		map.set("/dashboard/customers", "Customer Center");
		map.set("/dashboard/vendors", "Vendor Center");
		map.set("/dashboard/products", "Product/Service Center");
		map.set("/dashboard/accounting", "Accounting Center");
		map.set("/dashboard/reports", "Reports");
		map.set("/dashboard/settings", "Settings");
		map.set("/dashboard/audit-log", "Audit Log");
		
		// Add nested routes that might be accessed
		map.set("/dashboard/reports/customer-list", "Customer List Report");
		map.set("/dashboard/reports/sale-detail-by-customer", "Sale Detail By Customer");

		return map;
	}, [navData]);

	// Get title from pathname
	const getTitleFromPath = useCallback(
		(pathname: string): string => {
			// Try exact match first
			if (pathToTitleMap.has(pathname)) {
				return pathToTitleMap.get(pathname)!;
			}

			// Try matching parent paths
			const pathParts = pathname.split("/").filter(Boolean);
			for (let i = pathParts.length; i > 0; i--) {
				const testPath = "/" + pathParts.slice(0, i).join("/");
				if (pathToTitleMap.has(testPath)) {
					return pathToTitleMap.get(testPath)!;
				}
			}

			// Fallback: use last part of pathname
			const lastPart = pathParts[pathParts.length - 1];
			return lastPart
				? lastPart
						.split("-")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")
				: DEFAULT_DASHBOARD_TITLE;
		},
		[pathToTitleMap],
	);

	// Update history when pathname changes
	useEffect(() => {
		const currentPath = location.pathname;
		
		// Only track dashboard routes
		if (!currentPath.startsWith("/dashboard") && currentPath !== DEFAULT_DASHBOARD_PATH) {
			return;
		}

		const currentTitle = getTitleFromPath(currentPath);

		// Skip if it's Dashboard (already in history)
		if (currentPath === DEFAULT_DASHBOARD_PATH) {
			return;
		}

		setHistory((prev) => {
			// If already exists, keep order (do NOT move to end)
			const exists = prev.some((item) => item.path === currentPath);
			if (exists) return prev;

			// Only append when the route is not in stack yet (e.g. navigated from navbar)
			return [...prev, { path: currentPath, title: currentTitle }];
		});
	}, [location.pathname, getTitleFromPath]);

	// Save to localStorage whenever history changes
	useEffect(() => {
		localStorage.setItem("nav-history", JSON.stringify(history));
	}, [history]);

	const handleRemove = useCallback(
		(path: string, e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			setHistory((prev) => prev.filter((item) => item.path !== path));
		},
		[],
	);

	const handleClick = useCallback(
		(path: string) => {
			navigate(path);
		},
		[navigate],
	);

	const currentPath = location.pathname;
	const isActive = (path: string) => path === currentPath;
	const isDashboard = (path: string) => path === DEFAULT_DASHBOARD_PATH;
	const canRemove = (path: string) => !isDashboard(path) && !isActive(path);

	return (
		<StyledContainer>
			<StyledScrollArea>
				<StyledHistoryList>
					{history.map((item) => {
						const active = isActive(item.path);
						const removable = canRemove(item.path);

						return (
							<StyledHistoryItem key={item.path} $active={active}>
								<StyledHistoryLink
									href={item.path}
									onClick={(e: React.MouseEvent) => {
										e.preventDefault();
										handleClick(item.path);
									}}
									$active={active}
								>
									{active && <StyledActiveDot />}
									<StyledHistoryText $active={active}>{item.title}</StyledHistoryText>
								</StyledHistoryLink>
								{removable && (
									<StyledRemoveButton
										onClick={(e: React.MouseEvent) => handleRemove(item.path, e)}
										aria-label="Remove"
									>
										<Icon icon="lucide:x" size={14} />
									</StyledRemoveButton>
								)}
							</StyledHistoryItem>
						);
					})}
				</StyledHistoryList>
			</StyledScrollArea>
		</StyledContainer>
	);
}

//#region Styled Components
const StyledContainer = styled.div`
	flex: 1;
	overflow: hidden;
	margin-left: 1rem;
	min-width: 0;
`;

const StyledScrollArea = styled(ScrollArea)`
	width: 100%;
`;

const StyledHistoryList = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0;
	overflow-x: auto;
	overflow-y: hidden;

	&::-webkit-scrollbar {
		height: 4px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.colors.palette.gray[300]};
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: ${({ theme }) => theme.colors.palette.gray[400]};
	}
`;

const StyledHistoryItem = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 0.25rem;
	flex-shrink: 0;
	border-radius: 4px;
	border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
	background-color: ${({ theme, $active }) =>
		$active ? "#2065D1" : theme.colors.common.white};

	&:hover {
		background-color: ${({ theme, $active }) => ($active ? "" : theme.colors.palette.gray[200])};
	}
`;

const StyledHistoryLink = styled(RouterLink as any)<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.75rem;
	border-radius: 0.375rem;
	text-decoration: none;
	transition: all 0.2s ease;
	white-space: nowrap;
	background-color: ${({ theme, $active }) =>
		$active ? "#2065D1" : theme.colors.palette.gray[100]};
	color: ${({ theme, $active }) => ($active ? theme.colors.common.white : theme.colors.palette.gray[700])};
	font-size: 0.875rem;
	font-weight: ${({ $active }) => ($active ? 500 : 400)};

	&:hover {
		background-color: ${({ theme, $active }) => ($active ? "" : theme.colors.palette.gray[200])};
		color: ${({ theme, $active }) => ($active ? theme.colors.common.white : theme.colors.palette.gray[800])};
	}
`;

const StyledActiveDot = styled.div`
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.common.white};
	flex-shrink: 0;
`;

const StyledHistoryText = styled.span<{ $active: boolean }>`
	color: ${({ theme, $active }) => ($active ? theme.colors.common.white : theme.colors.common.black)};
`;

const StyledRemoveButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: none;
	background-color: transparent;
	color: ${({ theme }) => theme.colors.palette.gray[500]};
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
	padding: 0;

	&:hover {
		background-color: ${({ theme }) => theme.colors.palette.gray[200]};
		color: ${({ theme }) => theme.colors.palette.gray[700]};
	}
`;
//#endregion
