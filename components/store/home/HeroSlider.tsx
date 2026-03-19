"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop", // Electronics / Tech
        title: "Next Gen Electronics",
        subtitle: "Experience the future with our latest arrivals in smart home tech.",
        cta: "Shop Now",
        link: "/shop?category=Smart%20Home",
        color: "bg-blue-600"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2000&auto=format&fit=crop", // Phone
        title: "Flagship Smartphones",
        subtitle: "Unbeatable prices on the newest models from top brands.",
        cta: "View Offers",
        link: "/shop?category=Mobile",
        color: "bg-purple-600"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2000&auto=format&fit=crop", // Computer
        title: "Professional Computing",
        subtitle: "Power your workflow with high-performance workstations.",
        cta: "Explore",
        link: "/shop?category=Computers",
        color: "bg-slate-900"
    }
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-[280px] sm:h-[400px] md:h-[500px] w-full overflow-hidden bg-slate-900 group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                        <div className="max-w-xl space-y-3 sm:space-y-6 animate-in slide-in-from-left-10 duration-700 fade-in">
                            <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
                                {slide.title}
                            </h2>
                            <p className="text-sm sm:text-lg md:text-xl text-slate-200">
                                {slide.subtitle}
                            </p>
                            <Link href={slide.link}>
                                <Button size="lg" className={`${slide.color} border-none text-white hover:opacity-90 h-10 sm:h-12 px-5 sm:px-8 text-sm sm:text-lg rounded-full`}>
                                    {slide.cta} <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 sm:bg-white/10 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Previous Slide"
            >
                <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 sm:bg-white/10 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Next Slide"
            >
                <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-2.5 rounded-full transition-all ${idx === current ? "w-8 bg-blue-500" : "w-2.5 bg-white/50 hover:bg-white"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

        </div>
    );
}
