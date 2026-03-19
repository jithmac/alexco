import { redirect } from "next/navigation";

export default function CheckoutRedirect() {
    redirect("/shop/checkout");
}
