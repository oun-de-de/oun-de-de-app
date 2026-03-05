import React from "react";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { cn } from "@/core/utils";
import {
	PAPER_SIZE_LABELS,
	type PaperSizeMode,
	SORT_LABELS,
	type SortMode,
	TEMPLATE_LABELS,
	type TemplateMode,
} from "@/pages/dashboard/invoice/export-preview/constants";

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

export type ReportColumnLabels = Partial<Record<keyof ReportColumnVisibility, string>>;

interface ReportToolbarProps {
	leftActions?: React.ReactNode;
	rightActions?: React.ReactNode;
	className?: string;
	showSections?: ReportSectionVisibility;
	onShowSectionsChange?: (sections: ReportSectionVisibility) => void;
	showColumns?: ReportColumnVisibility;
	onShowColumnsChange?: (columns: ReportColumnVisibility) => void;
	columnLabels?: ReportColumnLabels;
	onPrint?: () => void;
	onExportExcel?: () => void;
	onCopy?: () => void;
	isExportExcelDisabled?: boolean;
	templateMode?: TemplateMode;
	onTemplateModeChange?: (mode: TemplateMode) => void;
	paperSizeMode?: PaperSizeMode;
	onPaperSizeModeChange?: (mode: PaperSizeMode) => void;
	sortMode?: SortMode;
	onSortModeChange?: (mode: SortMode) => void;
}

const DEFAULT_COLUMN_LABELS: Record<keyof ReportColumnVisibility, string> = {
	refNo: "Ref No",
	category: "Category",
	geography: "Geography",
	address: "Address",
	phone: "Phone",
};

function ReportToolbarComponent({
	leftActions,
	rightActions,
	className,
	showSections,
	onShowSectionsChange,
	showColumns,
	onShowColumnsChange,
	columnLabels,
	onPrint,
	onExportExcel,
	onCopy,
	isExportExcelDisabled = false,
	templateMode,
	onTemplateModeChange,
	paperSizeMode,
	onPaperSizeModeChange,
	sortMode,
	onSortModeChange,
}: ReportToolbarProps) {
	const resolvedColumnLabels = { ...DEFAULT_COLUMN_LABELS, ...columnLabels };
	const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false);

	return (
		<div className="flex flex-col">
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
										{resolvedColumnLabels.refNo}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={showColumns?.category}
										onCheckedChange={(checked) =>
											showColumns && onShowColumnsChange?.({ ...showColumns, category: !!checked })
										}
									>
										{resolvedColumnLabels.category}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={showColumns?.geography}
										onCheckedChange={(checked) =>
											showColumns && onShowColumnsChange?.({ ...showColumns, geography: !!checked })
										}
									>
										{resolvedColumnLabels.geography}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={showColumns?.address}
										onCheckedChange={(checked) =>
											showColumns && onShowColumnsChange?.({ ...showColumns, address: !!checked })
										}
									>
										{resolvedColumnLabels.address}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={showColumns?.phone}
										onCheckedChange={(checked) =>
											showColumns && onShowColumnsChange?.({ ...showColumns, phone: !!checked })
										}
									>
										{resolvedColumnLabels.phone}
									</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{templateMode && onTemplateModeChange && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild className="border-none">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
										>
											<Icon icon="mdi:file-document-outline" size="1.2em" />
											<span className="text-xs font-medium">Template: {TEMPLATE_LABELS[templateMode]}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-44">
										{(Object.keys(TEMPLATE_LABELS) as TemplateMode[]).map((mode) => (
											<DropdownMenuItem key={mode} onClick={() => onTemplateModeChange(mode)}>
												<Icon icon={templateMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
												{TEMPLATE_LABELS[mode]}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							{paperSizeMode && onPaperSizeModeChange && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild className="border-none">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
										>
											<Icon icon="mdi:file-outline" size="1.2em" />
											<span className="text-xs font-medium">Paper: {PAPER_SIZE_LABELS[paperSizeMode]}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-40">
										{(Object.keys(PAPER_SIZE_LABELS) as PaperSizeMode[]).map((mode) => (
											<DropdownMenuItem key={mode} onClick={() => onPaperSizeModeChange(mode)}>
												<Icon icon={paperSizeMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
												{PAPER_SIZE_LABELS[mode]}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							{sortMode && onSortModeChange && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild className="border-none">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
										>
											<Icon icon="mdi:sort-variant" size="1.2em" />
											<span className="text-xs font-medium">Sort: {SORT_LABELS[sortMode]}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-52">
										{(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
											<DropdownMenuItem key={mode} onClick={() => onSortModeChange(mode)}>
												<Icon icon={sortMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
												{SORT_LABELS[mode]}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</>
					)}
				</div>

				<div className="flex items-center gap-2">
					{rightActions || (
						<>
							<ToolbarButton
								icon="mdi:cog-outline"
								label="Customize"
								onClick={() => setIsCustomizeOpen((prev) => !prev)}
								className={isCustomizeOpen ? "bg-blue-50" : undefined}
							/>
							<ToolbarButton
								icon="mdi:file-excel-outline"
								label="Export Excel"
								onClick={onExportExcel}
								disabled={isExportExcelDisabled}
							/>
							<ToolbarButton icon="mdi:printer-outline" label="Print" onClick={onPrint} />
							{onCopy && <ToolbarButton icon="mdi:content-copy" label="Copy" onClick={onCopy} />}
						</>
					)}
				</div>
			</div>

			{!leftActions && !rightActions && isCustomizeOpen && (
				<div className="rounded-b-md border border-t-0 bg-white px-4 py-3 print:hidden">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Show</div>
							<div className="flex flex-wrap gap-2">
								<ToolbarToggleButton
									label="Header"
									active={!!showSections?.header}
									onClick={() =>
										showSections && onShowSectionsChange?.({ ...showSections, header: !showSections.header })
									}
								/>
								<ToolbarToggleButton
									label="Filter"
									active={!!showSections?.filter}
									onClick={() =>
										showSections && onShowSectionsChange?.({ ...showSections, filter: !showSections.filter })
									}
								/>
								<ToolbarToggleButton
									label="Footer"
									active={!!showSections?.footer}
									onClick={() =>
										showSections && onShowSectionsChange?.({ ...showSections, footer: !showSections.footer })
									}
								/>
								<ToolbarToggleButton
									label="Timestamp"
									active={!!showSections?.timestamp}
									onClick={() =>
										showSections && onShowSectionsChange?.({ ...showSections, timestamp: !showSections.timestamp })
									}
								/>
								<ToolbarToggleButton
									label="Signature"
									active={!!showSections?.signature}
									onClick={() =>
										showSections && onShowSectionsChange?.({ ...showSections, signature: !showSections.signature })
									}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Columns</div>
							<div className="flex flex-wrap gap-2">
								<ToolbarToggleButton
									label={resolvedColumnLabels.refNo}
									active={!!showColumns?.refNo}
									onClick={() => showColumns && onShowColumnsChange?.({ ...showColumns, refNo: !showColumns.refNo })}
								/>
								<ToolbarToggleButton
									label={resolvedColumnLabels.category}
									active={!!showColumns?.category}
									onClick={() =>
										showColumns && onShowColumnsChange?.({ ...showColumns, category: !showColumns.category })
									}
								/>
								<ToolbarToggleButton
									label={resolvedColumnLabels.geography}
									active={!!showColumns?.geography}
									onClick={() =>
										showColumns && onShowColumnsChange?.({ ...showColumns, geography: !showColumns.geography })
									}
								/>
								<ToolbarToggleButton
									label={resolvedColumnLabels.address}
									active={!!showColumns?.address}
									onClick={() =>
										showColumns && onShowColumnsChange?.({ ...showColumns, address: !showColumns.address })
									}
								/>
								<ToolbarToggleButton
									label={resolvedColumnLabels.phone}
									active={!!showColumns?.phone}
									onClick={() => showColumns && onShowColumnsChange?.({ ...showColumns, phone: !showColumns.phone })}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export const ReportToolbar = React.memo(ReportToolbarComponent);

interface ToolbarButtonProps {
	icon: string;
	label: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
}

function ToolbarButton({ icon, label, onClick, className, disabled = false }: ToolbarButtonProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className={cn("h-8 gap-1.5 px-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50", className)}
			onClick={onClick}
			disabled={disabled}
		>
			<Icon icon={icon} size="1.2em" />
			<span className="text-xs font-medium">{label}</span>
		</Button>
	);
}

interface ToolbarToggleButtonProps {
	label: string;
	active: boolean;
	onClick: () => void;
}

function ToolbarToggleButton({ label, active, onClick }: ToolbarToggleButtonProps) {
	return (
		<Button variant={active ? "secondary" : "outline"} size="sm" onClick={onClick}>
			{label}
		</Button>
	);
}
