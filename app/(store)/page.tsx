"use client";

import HeroSlider from "@/components/store/home/HeroSlider";
import FeaturesSection from "@/components/store/home/FeaturesSection";
import CategoryTiles from "@/components/store/home/CategoryTiles";
import FeaturedCollections from "@/components/store/home/FeaturedCollections";
import BrandCarousel from "@/components/store/home/BrandCarousel";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Trust Indicators */}
      <FeaturesSection />

      {/* 3. Category Grid */}
      <CategoryTiles />

      {/* 4. Featured Products (Tabs) */}
      <FeaturedCollections />

      {/* 5. Brand Showcase */}
      <BrandCarousel />
    </div>
  );
}
