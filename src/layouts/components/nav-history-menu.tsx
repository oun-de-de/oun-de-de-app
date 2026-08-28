import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import styled from "styled-components";
import { Icon } from "@/core/components/icon";
import { useFilteredNavData } from "@/layouts/dashboard/nav/nav-data/index";
import { RouterLink } from "@/routes/components/router-link";
import { getRouteTitle, SORTED_PATHS } from "./route-mappings";

type HistoryItem = {
	href: string;
	pathname: string;
	title: string;
	state?: unknown;
};

const DEFAULT_DASHBOARD_PATH = "/";
const DEFAULT_DASHBOARD_TITLE = "Dashboard";
const MAX_HISTORY_ITEMS = 12;
const NAV_HISTORY_STORAGE_KEY = "nav-history";

function normalizePath(path: string) {
	return path.replace(/\/+$/, "") || DEFAULT_DASHBOARD_PATH;
}

function buildHref(pathname: string, search: string, hash: string) {
	return `${pathname}${search}${hash}`;
}

function toPersistableState(state: unknown) {
	if (state == null) return undefined;

	try {
		return JSON.parse(JSON.stringify(state));
	} catch {
		return undefined;
	}
}

// Collapse detail/ID routes to their base path
const getCanonicalPath = (pathname: string): string => {
	// Exact match — keep as-is
	if (SORTED_PATHS.includes(pathname as any)) return pathname;

	// Prefix match — return the matched base instead of the raw path
	for (const base of SORTED_PATHS) {
		if (pathname.startsWith(`${base}/`)) {
			return base;
		}
	}

	return pathname;
};

export default function NavHistoryMenu() {
	const location = useLocation();
	const navigate = useNavigate();
	const navData = useFilteredNavData();
	const rafRef = useRef<number | null>(null);
	const [history, setHistory] = useState<HistoryItem[]>(() => {
		// Initialize with Dashboard
		const saved = localStorage.getItem(NAV_HISTORY_STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				const isHistoryItemArray = (value: unknown): value is HistoryItem[] =>
					Array.isArray(value) &&
					value.every(
						(item) =>
							item &&
							typeof item === "object" &&
							typeof (item as HistoryItem).href === "string" &&
							typeof (item as HistoryItem).pathname === "string" &&
							typeof (item as HistoryItem).title === "string",
					);
				if (!isHistoryItemArray(parsed)) {
					return [{ href: DEFAULT_DASHBOARD_PATH, pathname: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }];
				}
				// Ensure Dashboard is always first
				if (parsed.length > 0 && parsed[0].pathname !== DEFAULT_DASHBOARD_PATH) {
					return [
						{ href: DEFAULT_DASHBOARD_PATH, pathname: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE },
						...parsed,
					];
				}
				return parsed;
			} catch {
				return [{ href: DEFAULT_DASHBOARD_PATH, pathname: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }];
			}
		}
		return [{ href: DEFAULT_DASHBOARD_PATH, pathname: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE }];
	});

	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateScrollState = useCallback(() => {
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		rafRef.current = requestAnimationFrame(() => {
			const el = scrollRef.current;
			if (!el) return;
			const { scrollLeft, clientWidth, scrollWidth } = el;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
		});
	}, []);

	const scrollByAmount = (delta: number) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: delta, behavior: "smooth" });
	};

	// Create path to title mapping from nav data
	const { pathToTitleMap } = useMemo(() => {
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

		return { pathToTitleMap: map };
	}, [navData]);

	// Get title from pathname
	const getTitleFromPath = useCallback(
		(pathname: string): string => {
			// Try exact match first
			const mappedTitle = getRouteTitle(pathname);
			if (mappedTitle) {
				return mappedTitle;
			}

			const exactTitle = pathToTitleMap.get(pathname);
			if (exactTitle) {
				return exactTitle;
			}

			// Try matching parent paths
			const pathParts = pathname.split("/").filter(Boolean);
			for (let i = pathParts.length; i > 0; i--) {
				const testPath = `/${pathParts.slice(0, i).join("/")}`;
				const parentTitle = pathToTitleMap.get(testPath);
				if (parentTitle) {
					return parentTitle;
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

	// Update history when location changes
	useEffect(() => {
		const currentPathname = normalizePath(location.pathname);
		const currentHref = buildHref(currentPathname, location.search, location.hash);

		if (!currentPathname.startsWith("/dashboard") && currentPathname !== DEFAULT_DASHBOARD_PATH) {
			return;
		}

		if (currentPathname === DEFAULT_DASHBOARD_PATH) {
			return;
		}

		const resolvedPath = getCanonicalPath(currentPathname);
		const currentTitle = getTitleFromPath(currentPathname);
		const currentState = toPersistableState(location.state);

		setHistory((prev) => {
			// If exact href already exists, refresh its saved state.
			const exactIndex = prev.findIndex((item) => item.href === currentHref);
			if (exactIndex !== -1) {
				const next = [...prev];
				next[exactIndex] = {
					...next[exactIndex],
					title: currentTitle,
					state: currentState,
				};
				return next;
			}

			// Find any existing entry that shares the same canonical base
			const existingIndex = prev.findIndex((item) => getCanonicalPath(item.pathname) === resolvedPath);

			if (existingIndex !== -1) {
				const next = [...prev];
				next[existingIndex] = {
					href: currentHref,
					pathname: currentPathname,
					title: currentTitle,
					state: currentState,
				};
				return next;
			}

			// New entry — append
			const next = [
				...prev,
				{
					href: currentHref,
					pathname: currentPathname,
					title: currentTitle,
					state: currentState,
				},
			];
			if (next.length <= MAX_HISTORY_ITEMS) return next;

			const dashboard =
				next[0]?.pathname === DEFAULT_DASHBOARD_PATH
					? next[0]
					: { href: DEFAULT_DASHBOARD_PATH, pathname: DEFAULT_DASHBOARD_PATH, title: DEFAULT_DASHBOARD_TITLE };
			const tail = next.filter((item) => item.pathname !== DEFAULT_DASHBOARD_PATH);
			return [dashboard, ...tail.slice(-(MAX_HISTORY_ITEMS - 1))];
		});
	}, [location.pathname, location.search, location.hash, location.state, getTitleFromPath]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: updateScrollState is triggered on history update
	useEffect(() => {
		updateScrollState();
	}, [history, updateScrollState]);

	useEffect(() => {
		window.addEventListener("resize", updateScrollState);
		return () => {
			window.removeEventListener("resize", updateScrollState);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [updateScrollState]);

	// Save to localStorage whenever history changes
	useEffect(() => {
		localStorage.setItem(NAV_HISTORY_STORAGE_KEY, JSON.stringify(history));
	}, [history]);

	const handleRemove = useCallback((href: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setHistory((prev) => prev.filter((item) => item.href !== href));
	}, []);

	const currentHref = buildHref(normalizePath(location.pathname), location.search, location.hash);
	const isActive = (href: string) => href === currentHref;
	const isDashboard = (pathname: string) => pathname === DEFAULT_DASHBOARD_PATH;
	const canRemove = (item: HistoryItem) => !isDashboard(item.pathname) && !isActive(item.href);

	return (
		<StyledContainer>
			{canScrollLeft && (
				<ArrowButton $side="left" type="button" onClick={() => scrollByAmount(-160)} aria-label="Scroll left">
					<Icon icon="mdi:chevron-left" size={16} />
				</ArrowButton>
			)}
			<StyledHistoryList ref={scrollRef} onScroll={updateScrollState}>
				{history.map((item) => {
					const active = isActive(item.href);
					const removable = canRemove(item);

					return (
						<StyledHistoryItem key={item.href} $active={active}>
							<StyledHistoryLink
								href={item.href}
								state={item.state}
								$active={active}
								onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
									e.preventDefault();
									navigate(item.href, item.state !== undefined ? { state: item.state } : undefined);
								}}
							>
								{active && <StyledActiveDot />}
								<StyledHistoryText $active={active}>{item.title}</StyledHistoryText>
							</StyledHistoryLink>
							{removable && (
								<StyledRemoveButton onClick={(e: React.MouseEvent) => handleRemove(item.href, e)} aria-label="Remove">
									<Icon icon="lucide:x" size={14} />
								</StyledRemoveButton>
							)}
						</StyledHistoryItem>
					);
				})}
			</StyledHistoryList>

			{canScrollRight && (
				<ArrowButton $side="right" type="button" onClick={() => scrollByAmount(160)} aria-label="Scroll right">
					<Icon icon="mdi:chevron-right" size={16} />
				</ArrowButton>
			)}
		</StyledContainer>
	);
}

//#region Styled Components
const StyledContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 0;
`;

const StyledHistoryList = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ArrowButton = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 0px;" : "right: 0px;")}
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.common.white};
  color: ${({ theme }) => theme.colors.palette.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  z-index: 5;

  &:hover {
    background: ${({ theme }) => theme.colors.palette.gray[100]};
  }
`;

const StyledHistoryItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
  background-color: ${({ theme, $active }) => ($active ? "#60a5fa" : theme.colors.common.white)};

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
  background-color: ${({ theme, $active }) => ($active ? "#60a5fa" : theme.colors.palette.gray[100])};
  color: ${({ theme, $active }) => ($active ? theme.colors.common.white : theme.colors.palette.gray[700])};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

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
