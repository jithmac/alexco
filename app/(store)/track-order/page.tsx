"use client";

import { useState } from "react";
import { trackTicket, trackOrder } from "@/server-actions/public/tracking";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Package, Truck, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function TrackOrderPage() {
    const [activeTab, setActiveTab] = useState("repair");

    // Repair State
    const [ticketNum, setTicketNum] = useState("");
    const [phone, setPhone] = useState("");

    // Order State
    const [orderNum, setOrderNum] = useState("");
    const [contact, setContact] = useState(""); // Email or Phone

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleTrack = async () => {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            if (activeTab === "repair") {
                if (!ticketNum || !phone) {
                    setError("Please enter both Job ID and Phone Number");
                    setLoading(false);
                    return;
                }
                const res = await trackTicket(ticketNum, phone);
                if (res.success) {
                    setResult({ type: 'repair', ...res });
                } else {
                    setError(res.message || "Could not find ticket.");
                }
            } else {
                if (!orderNum || !contact) {
                    setError("Please enter both Order Number and Email/Phone");
                    setLoading(false);
                    return;
                }
                const res = await trackOrder(orderNum, contact);
                if (res.success) {
                    setResult({ type: 'order', ...res });
                } else {
                    setError(res.message || "Could not find order.");
                }
            }
        } catch (e) {
            setError("An error occurred while tracking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Track Your Status</h1>
                <p className="text-slate-500">
                    Check the status of your Repair Job or Online Order.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl border shadow-sm mb-8">
                <Tabs defaultValue="repair" onValueChange={(v) => { setActiveTab(v); setResult(null); setError(""); }}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="repair">Repair Job</TabsTrigger>
                        <TabsTrigger value="order">Online Order</TabsTrigger>
                    </TabsList>

                    <TabsContent value="repair" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Job ID / Receipt No</label>
                                <Input
                                    placeholder="e.g. JOB-2026-1001"
                                    value={ticketNum}
                                    onChange={(e) => setTicketNum(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                <Input
                                    placeholder="Registered Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="order" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Order Number</label>
                                <Input
                                    placeholder="e.g. ORD-123456"
                                    value={orderNum}
                                    onChange={(e) => setOrderNum(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email or Phone</label>
                                <Input
                                    placeholder="Enter Email or Phone"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={handleTrack}
                    disabled={loading}
                >
                    {loading ? "Searching..." : activeTab === 'repair' ? "Track Repair" : "Track Order"}
                </Button>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Results Display */}
            {result && result.type === 'repair' && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden fade-in">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{result.ticket.device_model}</h2>
                            <p className="text-sm text-slate-500">Customer: {result.ticket.customer_name}</p>
                        </div>
                        <div className="text-right">
                            <Badge className="mb-1 text-lg">{result.ticket.status}</Badge>
                            <div className="text-xs text-slate-500">ID: {result.ticket.ticket_number}</div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Repair Timeline
                        </h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {result.history.map((event: any, i: number) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-slate-900">{event.action_type}</div>
                                            <time className="font-caveat font-medium text-indigo-500 text-xs">
                                                {new Date(event.created_at).toLocaleDateString()}
                                            </time>
                                        </div>
                                        <div className="text-slate-500 text-sm">{event.description}</div>
                                    </div>
                                </div>
                            ))}
                            {result.history.length === 0 && (
                                <p className="text-center text-slate-400">No activity recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {result && result.type === 'order' && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden fade-in">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Order #{result.order.order_number}</h2>
                                <p className="text-sm text-slate-500">Placed on {new Date(result.order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className={
                                result.order.delivery_status === 'DELIVERED' ? 'bg-green-500' :
                                    result.order.delivery_status === 'SHIPPED' ? 'bg-blue-500' :
                                        result.order.delivery_status === 'PROCESSING' ? 'bg-orange-500' : 'bg-slate-500'
                            }>
                                {result.order.delivery_status}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-slate-500" /> Shipping Address
                                </h3>
                                <p className="text-slate-600 text-sm whitespace-pre-line bg-slate-50 p-3 rounded-lg border">
                                    {result.order.shipping_address || 'No address provided'}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-500" /> Delivery Info
                                </h3>
                                <div className="bg-slate-50 p-3 rounded-lg border text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Estimated Delivery:</span>
                                        <span className="font-medium text-slate-900">3-5 Business Days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Courier:</span>
                                        <span className="font-medium text-slate-900">{result.order.courier_name || 'Generic Courier'}</span>
                                    </div>
                                    {result.order.tracking_number && (
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="text-slate-500">Tracking #:</span>
                                            <span className="font-mono font-bold text-slate-900">{result.order.tracking_number}</span>
                                        </div>
                                    )}

                                    {result.order.tracking_url_template && result.order.tracking_number && (
                                        <div className="mt-4 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => window.open(result.order.tracking_url_template.replace('{tracking_number}', result.order.tracking_number), '_blank')}
                                            >
                                                <Truck className="w-4 h-4" />
                                                Track on {result.order.courier_name || 'Courier Site'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <h3 className="font-semibold mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {result.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="h-16 w-16 bg-slate-100 rounded-md relative overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={item.image.startsWith('/uploads')}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{item.name}</div>
                                        <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
