"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface PrintProps {
    ticket: any;
    type: 'job-card' | 'estimate' | 'invoice' | 'repair-sheet' | 'qa-report';
}

export default function TicketPrintout({ ticket, type }: PrintProps) {
    useEffect(() => {
        if (window.location.search.includes('print=true')) {
            window.print();
        }
    }, []);

    if (!ticket) return null;

    // Common Header
    const Header = ({ title }: { title: string }) => (
        <div className="text-center mb-6 border-b pb-4">
            <h1 className="font-bold text-2xl">ALEXCO</h1>
            <p className="text-sm">Digital Solutions & Repair Center</p>
            <p className="text-sm">123 Tech Street, Colombo | 077-123-4567</p>
            <div className="mt-4 flex justify-between items-end">
                <div className="text-left">
                    <div className="text-xs text-slate-500">Document Type</div>
                    <div className="font-bold text-lg uppercase">{title}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">Job ID</div>
                    <div className="font-mono font-bold text-lg">{ticket.ticket_number}</div>
                </div>
            </div>
        </div>
    );

    // Common Customer & Device Info
    const InfoSection = () => (
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
            <div>
                <h3 className="font-bold border-b mb-2">Customer Details</h3>
                <p><strong>Name:</strong> {ticket.customer_name}</p>
                <p><strong>Phone:</strong> {ticket.customer_phone}</p>
                <p className="text-xs text-slate-500 mt-1">Date: {new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div>
                <h3 className="font-bold border-b mb-2">Device Details</h3>
                <p><strong>Model:</strong> {ticket.device_model}</p>
                <p><strong>Serial/IMEI:</strong> {ticket.device_serial || 'N/A'}</p>
                <p><strong>Issue:</strong> {ticket.issue_description}</p>
            </div>
        </div>
    );

    // 1. JOB CARD (Device Receipt)
    if (type === 'job-card') {
        const accessories = ticket.accessories_received ? JSON.parse(ticket.accessories_received) : [];
        return (
            <div className="max-w-[210mm] mx-auto bg-white text-black p-8">
                <Header title="Device Receipt / Job Card" />
                <InfoSection />

                <div className="mb-6">
                    <h3 className="font-bold border-b mb-2 text-sm">Physical Condition & Accessories</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border p-2 min-h-[100px]">
                            <p className="font-semibold text-xs mb-1">Condition Checklist:</p>
                            <div className="grid grid-cols-1 gap-1">
                                <div><input type="checkbox" disabled /> Screen Cracked</div>
                                <div><input type="checkbox" disabled /> Body Scratches</div>
                                <div><input type="checkbox" disabled /> Liquid Damage</div>
                                <div><input type="checkbox" disabled /> Missing Screws</div>
                            </div>
                        </div>
                        <div className="border p-2 min-h-[100px]">
                            <p className="font-semibold text-xs mb-1">Accessories Received:</p>
                            {accessories.length > 0 ? (
                                <ul className="list-disc pl-4">
                                    {accessories.map((acc: string, i: number) => <li key={i}>{acc}</li>)}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic">No accessories</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-8 text-xs text-justify border p-4 bg-slate-50">
                    <p className="font-bold mb-1">Disclaimer & Terms:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>We are not responsible for any data loss. Please backup your data before handing over.</li>
                        <li>We are not responsible for any pre-existing hidden defects (e.g. liquid damage consequences).</li>
                        <li>Devices not collected within 30 days of completion may be disposed of to recover costs.</li>
                        <li>Diagnosis charges may apply if repair is rejected after estimation.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-20 mt-12 text-center text-sm">
                    <div className="border-t pt-2">Customer Signature</div>
                    <div className="border-t pt-2">Authorized Signature</div>
                </div>
            </div>
        );
    }

    // 2. DIAGNOSTIC ESTIMATE
    if (type === 'estimate') {
        const partsTotal = ticket.items?.reduce((sum: number, item: any) => sum + Number(item.line_total), 0) || 0;
        return (
            <div className="max-w-[210mm] mx-auto bg-white text-black p-8">
                <Header title="Repair Estimate" />
                <InfoSection />

                <div className="mb-6 text-sm">
                    <h3 className="font-bold border-b mb-2">Diagnosis Report</h3>
                    <div className="bg-slate-50 p-3 min-h-[80px] whitespace-pre-wrap">
                        {ticket.diagnosis_notes || "Pending Diagnosis"}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold border-b mb-2 text-sm">Detailed Cost Estimation</h3>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Item / Service</th>
                                <th className="py-2 text-right">Amount (LKR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ticket.items?.map((item: any) => (
                                <tr key={item.id} className="border-b border-t text-slate-600">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-right">{Number(item.line_total).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="border-b">
                                <td className="py-2 font-medium">Labor & Service Charges</td>
                                <td className="py-2 text-right">
                                    {Number(ticket.estimated_cost || 0).toLocaleString()}
                                </td>
                            </tr>
                            <tr className="font-bold text-lg">
                                <td className="py-4">Total Estimated Cost</td>
                                <td className="py-4 text-right">LKR {(Number(ticket.estimated_cost || 0) + partsTotal).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 border p-4">
                    <h4 className="font-bold text-sm mb-4">Customer Approval</h4>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-4">
                            <div className="border rounded px-4 py-2">☐ APPROVED</div>
                            <div className="border rounded px-4 py-2">☐ REJECTED</div>
                        </div>
                        <div className="w-48 border-b border-black"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Select Action</span>
                        <span>Signature / Date</span>
                    </div>
                </div>
            </div>
        );
    }

    // 5. FINAL INVOICE
    if (type === 'invoice') {
        const partsTotal = ticket.items?.reduce((sum: number, item: any) => sum + Number(item.line_total), 0) || 0;
        return (
            <div className="max-w-[210mm] mx-auto bg-white text-black p-8">
                <Header title="Final Invoice" />
                <InfoSection />

                <div className="mb-6">
                    <h3 className="font-bold border-b mb-2 text-sm">Billing Details</h3>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="py-2 pl-2">Description</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Rate</th>
                                <th className="py-2 text-right pr-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ticket.items?.map((item: any) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-2 pl-2">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-slate-500">{item.sku}</div>
                                    </td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">{Number(item.price_retail).toLocaleString()}</td>
                                    <td className="py-2 text-right pr-2">{Number(item.line_total).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="border-b">
                                <td className="py-2 pl-2 font-medium">Repair Service Fee</td>
                                <td className="py-2 text-right">1</td>
                                <td className="py-2 text-right">
                                    {Number(ticket.estimated_cost || 0).toLocaleString()}
                                </td>
                                <td className="py-2 text-right pr-2">
                                    {Number(ticket.estimated_cost || 0).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="py-4 text-right font-bold text-lg">TOTAL PAYABLE</td>
                                <td className="py-4 text-right pr-2 font-bold text-lg">
                                    LKR {(Number(ticket.estimated_cost || 0) + partsTotal).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="border p-4 text-sm">
                        <h4 className="font-bold mb-2">Warranty Information</h4>
                        <div className="space-y-1 text-xs">
                            <p><strong>Period:</strong> 30 Days (Service), 6 Months (Parts)</p>
                            <p><strong>Covers:</strong> Functionality of replaced parts only.</p>
                            <p><strong>Excludes:</strong> Physical damage, liquid damage, misuse.</p>
                        </div>
                    </div>
                    <div className="text-center pt-8">
                        <div className="border-t border-black w-3/4 mx-auto"></div>
                        <p className="text-sm mt-1">Cashier Signature</p>
                    </div>
                </div>

                <div className="text-center text-xs mt-12 text-slate-500">
                    Thank you for choosing Alexco!
                </div>
            </div>
        );
    }

    return <div>Invalid Print Type</div>;
}
