export default function SaleProductListEmpty() {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-4 p-4">
			<div className="text-2xl font-semibold text-gray-400">No Products Found</div>
			<div className="text-center text-gray-500">
				Try adjusting your filters or search terms to find what you're looking for.
			</div>
		</div>
	);
}
