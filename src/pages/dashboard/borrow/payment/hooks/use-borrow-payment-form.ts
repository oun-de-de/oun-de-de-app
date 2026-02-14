import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	useBorrowCartActions,
	useBorrowCartState,
	useCartTotal,
} from "@/pages/dashboard/borrow/stores/borrow-cart-store";

export function useBorrowPaymentForm() {
	const navigate = useNavigate();
	const { cart } = useBorrowCartState();
	const { clearCart, removeFromCart } = useBorrowCartActions();
	const totalAmount = useCartTotal();

	const [borrowerName, setBorrowerName] = useState("");
	const [phone, setPhone] = useState("");
	const [idCard, setIdCard] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [depositAmount, setDepositAmount] = useState<string>("");
	const [dueDate, setDueDate] = useState("");
	const [notes, setNotes] = useState("");
	const [refNo, setRefNo] = useState("");

	useEffect(() => {
		if (cart.length === 0) {
			toast.error("Cart is empty");
			navigate("/dashboard/borrow/new");
		}
	}, [cart.length, navigate]);

	const confirm = () => {
		if (cart.length === 0) {
			toast.error("Cart is empty");
			return;
		}
		if (!borrowerName.trim()) {
			toast.error("Borrower name is required");
			return;
		}
		toast.success("Transaction saved successfully!");
		clearCart();
		navigate("/dashboard/borrow");
	};

	return {
		cart,
		removeFromCart,
		totalAmount,
		borrowerName,
		setBorrowerName,
		phone,
		setPhone,
		idCard,
		setIdCard,
		paymentMethod,
		setPaymentMethod,
		depositAmount,
		setDepositAmount,
		dueDate,
		setDueDate,
		notes,
		setNotes,
		refNo,
		setRefNo,
		confirm,
	};
}
