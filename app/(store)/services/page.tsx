
export const metadata = {
    title: "Services & Repairs | Alexco",
    description: "Professional solar installation and electrical repair services in Sri Lanka.",
};

export default function ServicesPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900">Services & Repairs</h1>
                    <p className="text-slate-500 mt-4">
                        Professional solar installation, electrical wiring, and repair services.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="p-6 bg-white rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900">Solar Installation</h3>
                        <p className="text-slate-600 mt-2 text-sm">
                            Complete rooftop and ground-mounted solar panel installation with warranty.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900">Inverter Repair</h3>
                        <p className="text-slate-600 mt-2 text-sm">
                            Diagnosis and repair of all major inverter brands.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900">Electrical Wiring</h3>
                        <p className="text-slate-600 mt-2 text-sm">
                            Residential and commercial wiring services by certified electricians.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900">Smart Home Setup</h3>
                        <p className="text-slate-600 mt-2 text-sm">
                            IoT device installation, home automation, and security systems.
                        </p>
                    </div>
                </div>

                <div className="text-center py-8 text-slate-500">
                    <p>Call us at <span className="font-bold text-slate-900">+94 11 234 5678</span> to book a service.</p>
                </div>
            </div>
        </div>
    );
}
