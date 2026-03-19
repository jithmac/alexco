import { query } from "@/lib/db";
import { notFound } from "next/navigation";
// import ReactMarkdown from 'react-markdown'; // Removed: Package not installed
// Actually standard text for now or simple white-space-pre-wrap

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const rows = await query(`SELECT title FROM static_pages WHERE slug = ?`, [slug]) as any[];

    if (rows.length === 0) {
        return {
            title: 'Policy Not Found | Alexco'
        };
    }

    return {
        title: `${rows[0].title} | Alexco`,
    };
}

async function getPolicy(slug: string) {
    const rows = await query(`SELECT * FROM static_pages WHERE slug = ?`, [slug]) as any[];
    return rows[0] || null;
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const policy = await getPolicy(slug);

    if (!policy) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-200">
                {policy.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {/* Simple rendering for now. Admin text area saves plain text/markdown. */}
                {policy.content}
            </div>

            <div className="mt-12 text-sm text-slate-400">
                Last updated: {new Date(policy.updated_at).toLocaleDateString()}
            </div>
        </div>
    );
}
