"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    onRemove: (value: string) => void;
    maxFiles?: number;
}

export default function ImageUpload({
    value = [], // Default to empty array to prevent undefined error
    onChange,
    onRemove,
    maxFiles = 5
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        try {
            setUploading(true);
            const newUrls: string[] = [];

            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }

                const data = await response.json();
                newUrls.push(data.url);
            }

            // Combine existing images with new ones
            onChange([...value, ...newUrls]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    }, [onChange, value]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: maxFiles - value.length,
        disabled: uploading || value.length >= maxFiles
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {value.map((url) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Product Image"
                            src={url}
                            unoptimized={url.startsWith('/uploads')}
                        />
                    </div>
                ))}
            </div>

            {value.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-lg p-8 
                        flex flex-col items-center justify-center gap-2 
                        cursor-pointer transition-colors
                        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"}
                        ${uploading ? "opacity-50 pointer-events-none" : ""}
                    `}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="h-8 w-8 text-slate-400" />
                    )}
                    <div className="text-center text-sm text-slate-600">
                        {isDragActive ? (
                            <p>Drop the files here...</p>
                        ) : (
                            <>
                                <p className="font-semibold">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or WEBP (max {maxFiles} files)</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
