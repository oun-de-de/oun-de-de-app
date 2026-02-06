import { Icon } from "@iconify/react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormSelect, FormTextField } from "@/core/components/form";
import { Button } from "@/core/ui/button";
import { VEHICLE_TYPE_OPTIONS } from "../../utils/customer-utils";

export function VehicleListField() {
	const { control } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "vehicles",
	});

	return (
		<div className="space-y-4 col-span-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-gray-700">Vehicles</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => append({ vehicleType: "", licensePlate: "" })}
					className="flex items-center gap-2"
				>
					<Icon icon="mdi:plus" className="w-4 h-4" />
					Add Vehicle
				</Button>
			</div>

			<div className="space-y-4">
				{fields.map((field, index) => (
					<div key={field.id} className="flex gap-4 items-start">
						<div className="flex-1">
							<FormSelect
								name={`vehicles.${index}.vehicleType`}
								label="Vehicle Type"
								options={VEHICLE_TYPE_OPTIONS}
								placeholder="Select Type"
							/>
						</div>
						<div className="flex-1">
							<FormTextField
								name={`vehicles.${index}.licensePlate`}
								label="License Plate"
								placeholder="Enter plate number"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50"
							onClick={() => remove(index)}
						>
							<Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
						</Button>
					</div>
				))}
				{fields.length === 0 && (
					<div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-lg bg-gray-50">
						No vehicles added. Click "Add Vehicle" to register a vehicle.
					</div>
				)}
			</div>
		</div>
	);
}
