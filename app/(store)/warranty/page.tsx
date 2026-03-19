
export const metadata = {
    title: "Warranty Policy | Alexco",
    description: "Learn about our warranty coverage for solar panels and electrical products.",
};

export default function WarrantyPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900">Warranty Policy</h1>
                    <p className="text-slate-500 mt-4">
                        We stand behind the quality of our products with comprehensive warranty coverage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-3xl mb-4">☀️</div>
                        <h3 className="font-bold text-lg text-slate-900">Solar Panels</h3>
                        <div className="text-3xl font-bold text-blue-600 mt-2">25 Years</div>
                        <p className="text-slate-600 mt-2 text-sm">
                            Performance warranty ensuring 80% output after 25 years. 10-year product warranty against manufacturing defects.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-3xl mb-4">⚡</div>
                        <h3 className="font-bold text-lg text-slate-900">Inverters</h3>
                        <div className="text-3xl font-bold text-blue-600 mt-2">5 Years</div>
                        <p className="text-slate-600 mt-2 text-sm">
                            Full replacement warranty for inverters. Extended warranty options available for up to 10 years.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-3xl mb-4">🔋</div>
                        <h3 className="font-bold text-lg text-slate-900">Batteries</h3>
                        <div className="text-3xl font-bold text-blue-600 mt-2">3 Years</div>
                        <p className="text-slate-600 mt-2 text-sm">
                            Warranty covers manufacturing defects and premature capacity loss beyond normal degradation.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-3xl mb-4">🔌</div>
                        <h3 className="font-bold text-lg text-slate-900">Electrical Accessories</h3>
                        <div className="text-3xl font-bold text-blue-600 mt-2">1 Year</div>
                        <p className="text-slate-600 mt-2 text-sm">
                            Standard warranty for switches, sockets, and wiring accessories against defects.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-4">How to Claim Warranty</h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-600">
                        <li>Keep your original invoice as proof of purchase</li>
                        <li>Contact our support team with your order number</li>
                        <li>Describe the issue and provide photos if possible</li>
                        <li>Our technician will assess and process your claim</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
