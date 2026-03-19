export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">About Alexco Electronics</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                    Welcome to <strong>Alexco Electronics</strong>, your premier destination for cutting-edge electronics and sustainable energy solutions in Sri Lanka.
                    Established with a vision to empower homes and businesses with technology, we specialize in high-quality solar energy systems, electrical components, and the latest consumer electronics.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">Our Mission</h3>
                        <p className="text-slate-700">
                            To accelerate the adoption of sustainable energy and digital technology in Sri Lanka by providing accessible, high-quality, and reliable solutions.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">Our Vision</h3>
                        <p className="text-slate-700">
                            To be the most trusted partner for electrical and electronic innovations, driving the nation towards a smarter and greener future.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4 text-slate-900">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700 mb-8">
                    <li><strong>Expertise:</strong> Over a decade of experience in electrical engineering and solar installations.</li>
                    <li><strong>Quality Assurance:</strong> We partner only with globally recognized brands to ensure durability and performance.</li>
                    <li><strong>Customer Support:</strong> Dedicated after-sales service and technical support to keep your systems running smoothly.</li>
                    <li><strong>Innovation:</strong> Constantly updating our inventory with the latest tech trends and energy-efficient solutions.</li>
                </ul>

                <p className="text-slate-600 italic mt-8 border-l-4 border-blue-500 pl-4 py-2 bg-slate-50">
                    "At Alexco Electronics, we don't just sell products; we provide solutions that power your life."
                </p>
            </div>
        </div>
    );
}
