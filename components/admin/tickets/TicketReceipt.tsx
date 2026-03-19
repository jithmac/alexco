"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ReceiptProps {
    ticket: any;
}

export default function TicketReceipt({ ticket }: ReceiptProps) {
    if (!ticket) return null;

    useEffect(() => {
        // Auto print when loaded in a popup
        if (window.location.search.includes('print=true')) {
            window.print();
        }
    }, []);

    return (
        <div className="p-4 max-w-[80mm] mx-auto font-mono text-xs bg-white text-black print:p-0 print:w-full">
            <div className="text-center mb-4">
                <h1 className="font-bold text-lg">ALEXCO</h1>
                <p>Digital Solutions & Repair</p>
                <p>123 Tech Street, Colombo</p>
                <p>077-123-4567</p>
            </div>

            <div className="border-b border-black mb-2 pb-2">
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm my-1">
                    <span>JOB ID:</span>
                    <span>{ticket.ticket_number}</span>
                </div>
            </div>

            <div className="mb-2 space-y-1">
                <p><strong>Customer:</strong> {ticket.customer_name}</p>
                <p><strong>Phone:</strong> {ticket.customer_phone}</p>
                <p><strong>Device:</strong> {ticket.device_model}</p>
            </div>

            <div className="border-b border-black mb-2 pb-2">
                <p><strong>Issue:</strong></p>
                <p>{ticket.issue_description}</p>
            </div>

            {ticket.estimated_cost && (
                <div className="flex justify-between font-bold mb-2">
                    <span>Est. Cost:</span>
                    <span>LKR {Number(ticket.estimated_cost).toLocaleString()}</span>
                </div>
            )}

            <div className="text-center text-[10px] space-y-2 mt-4">
                <p>Terms & Conditions Apply.</p>
                <p>Items left for more than 30 days will be disposed.</p>
                <p>Check Status: alexco.lk/track</p>
                <div className="mt-4 pt-2 border-t border-dashed border-black">
                    <p>Thank You!</p>
                </div>
            </div>
        </div>
    );
}
