"use client";

import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "Genuine Products",
        description: "100% Authentic items with official warranty.",
        color: "text-blue-600 bg-blue-50"
    },
    {
        icon: Truck,
        title: "Island-wide Delivery",
        description: "Fast and secure delivery to your doorstep.",
        color: "text-green-600 bg-green-50"
    },
    {
        icon: RotateCcw,
        title: "Easy Returns",
        description: "Hassle-free 7 day return policy.",
        color: "text-orange-600 bg-orange-50"
    },
    {
        icon: CreditCard,
        title: "Secure Payments",
        description: "We accept Visa, Mastercard & Koko.",
        color: "text-purple-600 bg-purple-50"
    }
];

export default function FeaturesSection() {
    return (
        <section className="py-12 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 sm:gap-4 p-2 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-default">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors text-sm sm:text-base">{feature.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
