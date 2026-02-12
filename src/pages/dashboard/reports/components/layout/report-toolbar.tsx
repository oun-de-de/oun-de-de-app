import type React from "react";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { cn } from "@/core/utils";

export interface ReportSectionVisibility {
	header: boolean;
	filter: boolean;
	footer: boolean;
	timestamp: boolean;
	signature: boolean;
}

export interface ReportColumnVisibility {
	refNo: boolean;
	category: boolean;
	geography: boolean;
	address: boolean;
	phone: boolean;
}

interface ReportToolbarProps {
	leftActions?: React.ReactNode;
	rightActions?: React.ReactNode;
	className?: string;
	showSections?: ReportSectionVisibility;
	onShowSectionsChange?: (sections: ReportSectionVisibility) => void;
	showColumns?: ReportColumnVisibility;
	onShowColumnsChange?: (columns: ReportColumnVisibility) => void;
}

export function ReportToolbar({
	leftActions,
	rightActions,
	className,
	showSections,
	onShowSectionsChange,
	showColumns,
	onShowColumnsChange,
}: ReportToolbarProps) {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-between gap-2 overflow-x-auto rounded-md border bg-white p-2",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				{leftActions || (
					<>
						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
								>
									<Icon icon="mdi:eye-outline" size="1.2em" />
									<span className="text-xs font-medium">Show</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuCheckboxItem
									checked={showSections?.header}
									onCheckedChange={(checked) =>
										showSections && onShowSectionsChange?.({ ...showSections, header: !!checked })
									}
								>
									Header
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections?.filter}
									onCheckedChange={(checked) =>
										showSections && onShowSectionsChange?.({ ...showSections, filter: !!checked })
									}
								>
									Filter
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections?.footer}
									onCheckedChange={(checked) =>
										showSections && onShowSectionsChange?.({ ...showSections, footer: !!checked })
									}
								>
									Footer
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections?.timestamp}
									onCheckedChange={(checked) =>
										showSections && onShowSectionsChange?.({ ...showSections, timestamp: !!checked })
									}
								>
									Timestamp
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections?.signature}
									onCheckedChange={(checked) =>
										showSections && onShowSectionsChange?.({ ...showSections, signature: !!checked })
									}
								>
									Signature
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<ToolbarButton icon="mdi:file-document-outline" label="Template" />
						<ToolbarButton icon="mdi:file-outline" label="Paper Size" />

						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
								>
									<Icon icon="mdi:view-column-outline" size="1.2em" />
									<span className="text-xs font-medium">Columns</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuCheckboxItem
									checked={showColumns?.refNo}
									onCheckedChange={(checked) =>
										showColumns && onShowColumnsChange?.({ ...showColumns, refNo: !!checked })
									}
								>
									Ref No
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showColumns?.category}
									onCheckedChange={(checked) =>
										showColumns && onShowColumnsChange?.({ ...showColumns, category: !!checked })
									}
								>
									Category
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showColumns?.geography}
									onCheckedChange={(checked) =>
										showColumns && onShowColumnsChange?.({ ...showColumns, geography: !!checked })
									}
								>
									Geography
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showColumns?.address}
									onCheckedChange={(checked) =>
										showColumns && onShowColumnsChange?.({ ...showColumns, address: !!checked })
									}
								>
									Address
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showColumns?.phone}
									onCheckedChange={(checked) =>
										showColumns && onShowColumnsChange?.({ ...showColumns, phone: !!checked })
									}
								>
									Phone
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<ToolbarButton icon="mdi:sort-variant" label="Sort" />
					</>
				)}
			</div>

			<div className="flex items-center gap-2">
				{rightActions || (
					<>
						<ToolbarButton icon="mdi:cog-outline" label="Customize" />
						<ToolbarButton icon="mdi:file-excel-outline" label="Export Excel" />
						<ToolbarButton icon="mdi:printer-outline" label="Print" />
						<ToolbarButton icon="mdi:content-copy" label="Copy" />
					</>
				)}
			</div>
		</div>
	);
}

interface ToolbarButtonProps {
	icon: string;
	label: string;
	onClick?: () => void;
	className?: string;
}

function ToolbarButton({ icon, label, onClick, className }: ToolbarButtonProps) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className={cn("h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50", className)}
			onClick={onClick}
		>
			<Icon icon={icon} size="1.2em" />
			<span className="text-xs font-medium">{label}</span>
		</Button>
	);
}
