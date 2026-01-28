import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { Button, type ButtonProps } from "@/core/ui/button";
import { cn } from "@/core/utils";

const separatorVariants = cva("", {
	variants: {
		variant: {
			default: "border-l-white/20",
			destructive: "border-l-white/20",
			outline: "border-l-gray-300 hover:border-l-gray-300",
			secondary: "border-l-gray-300 hover:border-l-gray-300",
			ghost: "border-l-gray-300 hover:border-l-gray-300",
			link: "border-l-transparent",
			linkSecondary: "border-l-transparent",
			contrast: "border-l-white/20",
			success: "border-l-white/20",
			warning: "border-l-white/20",
			info: "border-l-white/20",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type ActionItem = {
	label: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
};

type Props = {
	mainAction: ActionItem;
	options: ActionItem[];
	className?: string;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	mainButtonClassName?: string;
	triggerButtonClassName?: string;
	dropdownContentClassName?: string;
	dropdownItemClassName?: string;
};

export function SplitButton({
	mainAction,
	options,
	className = "",
	variant = "default",
	size = "default",
	mainButtonClassName,
	triggerButtonClassName,
	dropdownContentClassName,
	dropdownItemClassName,
}: Props) {
	return (
		<div className={cn("inline-flex relative vertical-middle rounded-md shadow-sm [&>*]:m-0", className)}>
			<Button
				type="button"
				variant={variant}
				size={size}
				onClick={mainAction.onClick}
				disabled={mainAction.disabled}
				className={cn(
					"split-button-main rounded-r-none relative z-10 focus:z-20 focus-visible:z-20 cursor-pointer",
					mainButtonClassName,
				)}
			>
				{mainAction.label}
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<Button
						type="button"
						variant={variant}
						size={size}
						className={cn(
							separatorVariants({ variant }),
							"split-button-trigger rounded-l-none px-2 relative z-10 -ml-px border-l border-l-solid focus:z-20 focus-visible:z-20 cursor-pointer",
							triggerButtonClassName,
						)}
					>
						<span className="sr-only">Open options</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>

				<DropdownMenu.Portal>
					<DropdownMenu.Content
						align="end"
						sideOffset={4}
						className={cn(
							"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
							dropdownContentClassName,
						)}
					>
						{options.map((option, index) => (
							<DropdownMenu.Item
								key={index}
								onClick={option.onClick}
								disabled={option.disabled}
								className={cn(
									"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
									dropdownItemClassName,
								)}
							>
								{option.label}
							</DropdownMenu.Item>
						))}
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
		</div>
	);
}
