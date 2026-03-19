import DeliveryRateManager from "@/components/admin/settings/DeliveryRateManager";
import CourierManager from "@/components/admin/settings/CourierManager"; // Import CourierManager

export default function DeliverySettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Settings</h1>
                <p className="text-slate-500">Configure delivery rates and courier services.</p>
            </div>

            <DeliveryRateManager />
            <CourierManager /> {/* Render CourierManager */}
        </div>
    );
}
