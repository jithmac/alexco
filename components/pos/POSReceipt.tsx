"use client";

import { useEffect } from "react";

export default function POSReceipt({ order }: { order: any }) {


    return (
        <div className="bg-white w-[75mm] p-2 text-black font-mono text-xs leading-tight shadow-md print:shadow-none print:w-full">
            {/* Styles are handled globally */}

            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="font-bold text-xl mb-1 text-slate-900">ALEXCO ELECTRONICS</h1>
                <p className="text-xs text-slate-600">Solar & Electrical Solutions</p>
                <p className="text-xs text-slate-500">123 Main Street, Colombo 03</p>
                <p className="text-xs text-slate-500">Tel: +94 11 234 5678</p>
            </div>

            {/* Info */}
            <div className="mb-4 border-b border-black pb-2 border-dashed">
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date(order.created_at || Date.now()).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                    <span>Order:</span>
                    <span>{order.order_number}</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-4 border-b border-black pb-2 border-dashed">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="w-8">Qty</th>
                            <th>Item</th>
                            <th className="text-right">Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="align-top py-1">{item.quantity}</td>
                                <td className="align-top py-1">
                                    <div className="line-clamp-2">{item.name}</div>
                                    {/* Variation Details */}
                                    {(() => {
                                        const variations = typeof item.variant_options === 'string' 
                                            ? JSON.parse(item.variant_options) 
                                            : (item.variant_options || item.variations);
                                        
                                        if (variations && Object.keys(variations).length > 0) {
                                            return (
                                                <div className="text-[9px] text-slate-500 mt-0.5">
                                                    {Object.entries(variations).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </td>
                                <td className="align-top text-right py-1">
                                    {(item.line_total).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mb-6">
                <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>LKR {(order.total_amount ?? order.total ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span>Paid via:</span>
                    <span>{order.payment_method}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-8">
                <p>Thank you for shopping with us!</p>
                <p className="mt-1">No refunds for sold items.</p>
                <p>Warranty applies to eligible items only.</p>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400">
                Powered by Alexco Platform
            </div>
        </div>
    );
}
