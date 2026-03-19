import { getOrderDetails } from "@/server-actions/pos/orders";
import POSReceipt from "@/components/pos/POSReceipt";

export default async function POSPrintPage({ params }: { params: Promise<{ orderNumber: string }> }) {
    const { orderNumber } = await params;
    const order = await getOrderDetails(orderNumber);

    if (!order) {
        return <div className="p-4 text-center">Order not found</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center py-8">
            <POSReceipt order={order} />
        </div>
    );
}
