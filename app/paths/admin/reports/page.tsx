import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3, Calculator, Receipt, ArrowRight, TrendingUp } from "lucide-react";

export const metadata = {
    title: "Reports Hub | Alexco Admin",
};

export default function ReportsHubPage() {
    const reports = [
        {
            title: "Margin & Profitability",
            description: "Analyze cost vs. retail pricing, profit margins, and inventory value.",
            href: "/paths/admin/reports/margins",
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Payroll Reports",
            description: "View employee salary slips, EPF/ETF returns, and bank transfer lists.",
            href: "/paths/HR/reports",
            icon: Calculator,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Inventory Ledger",
            description: "Track all stock movements, audits, and adjustments history.",
            href: "/paths/admin/inventory",
            icon: Receipt,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Sales Analytics",
            description: "Coming Soon: Detailed breakdown of sales performance by category.",
            href: "#",
            icon: BarChart3,
            color: "text-slate-400",
            bgColor: "bg-slate-100",
            disabled: true
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports Hub</h1>
                <p className="text-slate-500">Centralized access to all system analytics and reporting tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <Link
                        key={report.title}
                        href={report.href}
                        className={`block group ${report.disabled ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        <Card className="h-full hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-3 rounded-lg ${report.bgColor} ${report.color}`}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    {report.description}
                                </CardDescription>
                                {!report.disabled && (
                                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:underline">
                                        View Report <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
