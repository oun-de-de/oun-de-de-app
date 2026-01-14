import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

type DashboardDropdownOption = {
  id: string;
  label: string;
};

type DashboardDropdownMenuProps = {
  value: string;
  onChange: (value: string) => void;
  options: DashboardDropdownOption[];
};

export default function DashboardDropdownMenu({
  value,
  onChange,
  options,
}: DashboardDropdownMenuProps) {
  const selected = options.find((option) => option.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex h-9 items-center gap-1 rounded border border-gray-300 bg-white px-3 text-sm font-medium">
          <span className="text-gray-500">{selected?.label ?? ""}</span>
          <ChevronDownIcon
            className="size-4 transition-transform group-data-[state=open]:rotate-180 text-gray-500"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

