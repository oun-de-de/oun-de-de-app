import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import type { ReportTemplateColumn } from "@/pages/dashboard/reports/components/layout/report-template-table";
import type { ReportSectionVisibility } from "@/pages/dashboard/reports/components/layout/report-toolbar";
import { ReportToolbar } from "../../../reports/components/layout/report-toolbar";
import {
	PAPER_SIZE_LABELS,
	type PaperSizeMode,
	SORT_LABELS,
	type SortMode,
	TEMPLATE_LABELS,
	type TemplateMode,
} from "../constants";

const toolbarButtonClassName = "h-8 gap-1.5 px-2 text-sky-600 hover:bg-sky-50";

type ExportPreviewToolbarProps = {
	showSections: ReportSectionVisibility;
	onShowSectionsChange: (sections: ReportSectionVisibility) => void;
	templateMode: TemplateMode;
	onTemplateModeChange: (mode: TemplateMode) => void;
	paperSizeMode: PaperSizeMode;
	onPaperSizeModeChange: (mode: PaperSizeMode) => void;
	sortMode: SortMode;
	onSortModeChange: (mode: SortMode) => void;
	columns: ReportTemplateColumn[];
	columnVisibility: Record<string, boolean>;
	onColumnVisibilityChange: (columnId: string, checked: boolean) => void;
	onExport: () => void;
	onPrint: () => void;
	isExporting: boolean;
	isExportDisabled: boolean;
};

export function ExportPreviewToolbar({
	showSections,
	onShowSectionsChange,
	templateMode,
	onTemplateModeChange,
	paperSizeMode,
	onPaperSizeModeChange,
	sortMode,
	onSortModeChange,
	columns,
	columnVisibility,
	onColumnVisibilityChange,
	onExport,
	onPrint,
	isExporting,
	isExportDisabled,
}: ExportPreviewToolbarProps) {
	return (
		<ReportToolbar
			className="rounded-b-none border-b-0"
			showSections={showSections}
			onShowSectionsChange={onShowSectionsChange}
			leftActions={
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="border-none">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:eye-outline" size="1.2em" />
								<span className="text-xs font-medium">Show</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-48">
							<DropdownMenuCheckboxItem
								checked={showSections.header}
								onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, header: !!checked })}
							>
								Header
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={showSections.footer}
								onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, footer: !!checked })}
							>
								Footer
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={showSections.timestamp}
								onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, timestamp: !!checked })}
							>
								Timestamp
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={showSections.signature}
								onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, signature: !!checked })}
							>
								Signature
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild className="border-none">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:file-document-outline" size="1.2em" />
								<span className="text-xs font-medium">Template</span>
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

					<DropdownMenu>
						<DropdownMenuTrigger asChild className="border-none">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:file-outline" size="1.2em" />
								<span className="text-xs font-medium">Paper Size</span>
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

					<DropdownMenu>
						<DropdownMenuTrigger asChild className="border-none">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:view-column-outline" size="1.2em" />
								<span className="text-xs font-medium">Columns</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-52">
							{columns.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									checked={columnVisibility[column.id] !== false}
									onCheckedChange={(checked) => onColumnVisibilityChange(column.id, !!checked)}
								>
									{typeof column.header === "string" ? column.header : column.id}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild className="border-none">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:sort-variant" size="1.2em" />
								<span className="text-xs font-medium">Sort</span>
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
				</div>
			}
			rightActions={
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
						<Icon icon="mdi:cog-outline" size="1.2em" />
						<span className="text-xs font-medium">Customize</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={toolbarButtonClassName}
						onClick={onExport}
						disabled={isExportDisabled}
					>
						<Icon icon="mdi:file-excel-outline" size="1.2em" />
						<span className="text-xs font-medium">{isExporting ? "Exporting..." : "Export Excel"}</span>
					</Button>
					<Button variant="ghost" size="sm" className={toolbarButtonClassName} onClick={onPrint}>
						<Icon icon="mdi:printer-outline" size="1.2em" />
						<span className="text-xs font-medium">Print</span>
					</Button>
					<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
						<Icon icon="mdi:content-copy" size="1.2em" />
						<span className="text-xs font-medium">Copy</span>
					</Button>
				</div>
			}
		/>
	);
}
