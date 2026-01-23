import Main from "./main";
import SaleHeader from "./header";

export default function SaleLayout() {
	return (
		<div data-slot="slash-layout-root" className="w-full min-h-screen bg-neutral-50">
			<div className="relative w-full min-h-screen flex flex-col flex-1 transition-[padding] duration-300 ease-in-out">
				<SaleHeader title="ក្រសួងអប់រំ យុវជន និង កីឡា II" />
				<Main />
			</div>
		</div>
	);
}
