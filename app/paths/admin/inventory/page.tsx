import InventoryAlerts from "@/components/admin/InventoryAlerts";
import InventoryList from "@/components/admin/inventory/InventoryList";

export const metadata = {
    title: "Admin Inventory | Alexco",
};

export default function AdminInventoryPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                <p className="text-slate-500">View conflicts, stock levels, and ledger history.</p>
            </div>

            <InventoryAlerts />

            {/* Full Stock List Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Stock Listing</h2>
                <InventoryList />
            </div>
        </div>
    );
}
