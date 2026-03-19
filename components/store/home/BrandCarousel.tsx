"use client";

// Simple infinite scroll marquee
export default function BrandCarousel() {
    const brands = [
        "Samsung", "Apple", "LG", "Sony", "Dell", "HP", "Lenovo", "Asus", "Xiaomi", "Huawei"
    ];

    return (
        <section className="py-12 border-t border-slate-100 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Trusted by Top Brands</h3>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex gap-16 px-8">
                    {brands.map((brand, i) => (
                        <div key={i} className="text-2xl font-bold text-slate-300 hover:text-slate-600 transition-colors cursor-pointer select-none">
                            {brand}
                        </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {brands.map((brand, i) => (
                        <div key={`dup-${i}`} className="text-2xl font-bold text-slate-300 hover:text-slate-600 transition-colors cursor-pointer select-none">
                            {brand}
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
