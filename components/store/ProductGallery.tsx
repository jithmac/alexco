"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    videoUrl?: string | null;
    name: string;
}

type GalleryItem = { type: 'image', url: string } | { type: 'video', url: string };

export default function ProductGallery({ images, videoUrl, name }: ProductGalleryProps) {
    const items: GalleryItem[] = [
        ...(images || []).map(url => ({ type: 'image' as const, url })),
        ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : [])
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

    if (items.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <span className="text-6xl grayscale opacity-20">📦</span>
            </div>
        );
    }

    const selectedItem = items[selectedIndex];

    // Helper to get embed URL
    const getEmbedUrl = (url: string) => {
        try {
            // Handle standard youtube links and shortened links
            let videoId = "";
            if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            }

            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            return url;
        } catch (e) {
            return url;
        }
    };

    return (
        <div className="space-y-4">
            {/* Main Display */}
            <div className="aspect-square bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden relative group">
                {selectedItem.type === 'video' ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={getEmbedUrl(selectedItem.url)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <Image
                        src={selectedItem.url}
                        alt={name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        unoptimized={selectedItem.url.startsWith('/uploads')}
                    />
                )}
            </div>

            {/* Thumbnails */}
            {items.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-slate-50",
                                selectedIndex === idx ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {item.type === 'video' ? (
                                <Play className="h-8 w-8 text-red-600 fill-current" />
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={`${name} view ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized={item.url.startsWith('/uploads')}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
