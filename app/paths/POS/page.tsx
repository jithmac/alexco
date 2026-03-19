import POSInterface from "@/components/pos/POSInterface";

export const metadata = {
    title: "Alexco POS | Checkouts",
    description: "Offline-First Point of Sale",
};

export default function POSPage() {
    return (
        <div className="h-screen overflow-hidden">
            <POSInterface />
        </div>
    );
}
