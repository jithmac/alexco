"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPageContent, savePageContent } from "@/server-actions/admin/content";

const PAGES = [
    { slug: 'privacy-policy', name: 'Privacy Policy' },
    { slug: 'terms-conditions', name: 'Terms & Conditions' },
    { slug: 'refund-policy', name: 'Refund Policy' }
];

export default function PoliciesSettingsPage() {
    const [selectedPage, setSelectedPage] = useState(PAGES[0].slug);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getPageContent(selectedPage);
                setContent(data?.content || "");
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [selectedPage]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await savePageContent(selectedPage, PAGES.find(p => p.slug === selectedPage)?.name || "Policy", content);
            alert("Content saved successfully");
        } catch (e) {
            alert("Failed to save content");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Policy Pages Content</h1>

            <div className="grid gap-6">
                <div className="w-[300px]">
                    <label className="block text-sm font-medium mb-2">Select Page to Edit</label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGES.map(p => (
                                <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative">
                    {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">Loading...</div>}
                    <label className="block text-sm font-medium mb-2">Page Content (Markdown Supported)</label>
                    <textarea
                        className="w-full h-[500px] p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="# H1 Title\n\nYour content here..."
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving || loading} size="lg">
                        {saving ? "Saving..." : "Save Content"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
