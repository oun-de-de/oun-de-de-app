import Icon from "@/components/icon/icon";
import useLocale from "@/locales/use-locale";
import { TooltipContent } from "@/ui/tooltip";
import { Tooltip } from "@/ui/tooltip";
import { TooltipTrigger } from "@/ui/tooltip";
import { TooltipProvider } from "@/ui/tooltip";
import { NavItemRenderer } from "../components";
import { navItemStyles } from "../styles";
import type { NavItemProps } from "../types";

export function NavItem(item: NavItemProps) {
	const { title, icon, info, caption, open, hasChild } = item;
	const { t } = useLocale();

	const content = (
		<>
			{/* Icon */}
			<span style={navItemStyles.icon} className="mr-3 items-center justify-center">
				{icon && typeof icon === "string" ? <Icon icon={icon} /> : icon}
			</span>

			{/* Texts */}
			<span style={navItemStyles.texts} className="min-h-[24px]">
				{/* Title */}
				<span style={navItemStyles.title}>{t(title)}</span>

				{/* Caption */}
				{caption && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span style={navItemStyles.caption}>{t(caption)}</span>
							</TooltipTrigger>
							<TooltipContent side="top" align="start">
								{t(caption)}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</span>

			{/* Info */}
			{info && <span style={navItemStyles.info}>{info}</span>}

			{/* Arrow */}
			{hasChild && (
				<Icon
					icon="eva:arrow-ios-forward-fill"
					style={{
						...navItemStyles.arrow,
						transform: open ? "rotate(90deg)" : "rotate(0deg)",
					}}
				/>
			)}
		</>
	);

	return (
		<NavItemRenderer item={item} className="min-h-[44px]">
			{content}
		</NavItemRenderer>
	);
}
