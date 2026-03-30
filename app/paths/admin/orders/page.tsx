"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Filter, FileText, Truck, Store, CheckCircle, Loader2, RefreshCw, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOnlineOrders, updateOrderStatus, confirmOrder } from "@/server-actions/admin/orders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: string }) {
    const sKey = String(status || "").toUpperCase();
    const map: Record<string, { label: string; className: string }> = {
        PENDING:          { label: "Pending",          className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        CONFIRMED:        { label: "Confirmed",         className: "bg-blue-100 text-blue-800 border-blue-300" },
        PICKUP:           { label: "Store Pickup",      className: "bg-teal-100 text-teal-800 border-teal-300" },
        SHIPPED:          { label: "Shipped",           className: "bg-purple-100 text-purple-800 border-purple-300" },
        DELIVERED:        { label: "Delivered",         className: "bg-green-100 text-green-800 border-green-300" },
        CANCELLED:        { label: "Cancelled",         className: "bg-red-100 text-red-800 border-red-300" },
    };
    const s = map[sKey] || { label: status || "—", className: "bg-slate-100 text-slate-700" };
    return (
        <Badge variant="outline" className={`text-xs font-semibold ${s.className}`}>
            {s.label}
        </Badge>
    );
}

function PaymentBadge({ method }: { method: string }) {
    const labels: Record<string, string> = {
        cod: "Cash on Delivery",
        bank_transfer: "Bank Transfer",
        payhere: "PayHere",
    };
    return <Badge variant="outline" className="text-xs">{labels[method] || method}</Badge>;
}

export default function OnlineOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [viewReceipt, setViewReceipt] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<string | null>(null);
    const { toast } = useToast();

    const [couriers, setCouriers] = useState<any[]>([]);
    const [shippingOrder, setShippingOrder] = useState<string | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<string>("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [savingShip, setSavingShip] = useState(false);

    async function loadData() {
        setLoading(true);
        const [ordersData, couriersData] = await Promise.all([
            getOnlineOrders(statusFilter),
            import("@/server-actions/admin/couriers").then(mod => mod.getCouriers())
        ]);
        setOrders(ordersData);
        setCouriers(couriersData);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, [statusFilter]);

    const handleConfirm = async (orderId: string) => {
        setConfirming(orderId);
        const result = await confirmOrder(orderId);
        setConfirming(null);
        if (result.success) {
            toast({ title: "Order Confirmed ✓" });
            loadData();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, delivery_status: 'CONFIRMED' });
            }
        } else {
            toast({ title: "Failed to confirm order", variant: "destructive" });
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (newStatus === "SHIPPED") {
            setShippingOrder(orderId);
            setTrackingNumber("");
            setSelectedCourier("");
            return;
        }
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            toast({ title: "Status Updated" });
            loadData();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, delivery_status: newStatus });
            }
        } else {
            toast({ title: "Failed to update status", variant: "destructive" });
        }
    };

    const confirmShipping = async () => {
        if (!shippingOrder) return;
        if (!selectedCourier) return toast({ title: "Select a courier", variant: "destructive" });
        if (!trackingNumber) return toast({ title: "Enter tracking number", variant: "destructive" });
        setSavingShip(true);
        const result = await updateOrderStatus(shippingOrder, "SHIPPED", selectedCourier, trackingNumber);
        setSavingShip(false);
        if (result.success) {
            toast({ title: "Order marked as Shipped ✓" });
            loadData();
        } else {
            toast({ title: "Failed to ship order", variant: "destructive" });
        }
        setShippingOrder(null);
    };

    return (
        <div className="space-y-4 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Online Orders</h1>
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Orders</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PICKUP">Store Pickup</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Order #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading orders...
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-slate-50">
                                    <TableCell className="font-mono text-sm font-medium">{order.order_number}</TableCell>
                                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString()}
                                        <div className="text-xs">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-slate-500">{order.customer_phone}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">LKR {Number(order.total_amount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {order.delivery_method === 'pickup' ? (
                                            <Badge className="bg-teal-100 text-teal-800 border-teal-200 gap-1 text-xs">
                                                <Store className="h-3 w-3" /> Pickup
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
                                                <Truck className="h-3 w-3" /> Delivery
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <PaymentBadge method={order.payment_method} />
                                            {order.payment_proof && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewReceipt(order.payment_proof)}>
                                                    <FileText className="h-3 w-3 text-blue-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <StatusBadge status={order.delivery_status} />
                                            {/* Confirm button for COD and Bank Transfer waiting confirmation */}
                                            {(String(order.delivery_status).toUpperCase() === 'PENDING' || String(order.delivery_status).toUpperCase() === 'PICKUP') &&
                                                ['cod', 'cash on delivery', 'bank_transfer', 'bank transfer'].includes(String(order.payment_method).toLowerCase()) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleConfirm(order.id)}
                                                    disabled={confirming === order.id}
                                                >
                                                    {confirming === order.id
                                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                                        : <><CheckCircle className="h-3 w-3 mr-1" />Confirm</>
                                                    }
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {order.delivery_status === 'CONFIRMED' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleStatusChange(order.id, "SHIPPED")}
                                                >
                                                    <Truck className="h-3 w-3 mr-1" /> Ship
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Receipt Viewer */}
            <Dialog open={!!viewReceipt} onOpenChange={() => setViewReceipt(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center bg-slate-100 p-4 rounded-lg min-h-[300px] items-center">
                        {viewReceipt && (
                            <img src={viewReceipt} alt="Receipt" className="max-w-full max-h-[600px] object-contain rounded" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Ship Order Dialog */}
            <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Shipped</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Courier</label>
                            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Courier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {couriers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tracking Number</label>
                            <Input
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="e.g. 1Z999AA10123456784"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShippingOrder(null)}>Cancel</Button>
                        <Button onClick={confirmShipping} disabled={savingShip}>
                            {savingShip ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Shipment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-slate-500" />
                            Order #{selectedOrder?.order_number}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-5 pt-2">
                            {/* Status Row */}
                            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                                <StatusBadge status={selectedOrder.delivery_status} />
                                <PaymentBadge method={selectedOrder.payment_method} />
                                {selectedOrder.delivery_method === 'pickup' ? (
                                    <Badge className="bg-teal-100 text-teal-800 border-teal-200 gap-1 text-xs"><Store className="h-3 w-3" /> Store Pickup</Badge>
                                ) : (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs"><Truck className="h-3 w-3" /> Delivery</Badge>
                                )}
                                <span className="ml-auto text-xs text-slate-500">
                                    {new Date(selectedOrder.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer Info */}
                                <div className="p-4 bg-white rounded-lg border space-y-2">
                                    <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Customer</h4>
                                    <p className="font-bold text-base">{selectedOrder.customer_name}</p>
                                    <p className="text-sm text-slate-700">{selectedOrder.customer_phone}</p>
                                    {selectedOrder.customer_email && (
                                        <p className="text-sm text-slate-600">{selectedOrder.customer_email}</p>
                                    )}
                                    <Separator />
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedOrder.shipping_address}</p>
                                </div>

                                {/* Payment & Tracking */}
                                <div className="p-4 bg-white rounded-lg border space-y-3">
                                    <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Payment & Tracking</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Amount</span>
                                            <span className="font-semibold">LKR {Number(selectedOrder.total_amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Payment Status</span>
                                            <span className="font-medium capitalize">{selectedOrder.payment_status || 'Unpaid'}</span>
                                        </div>
                                    </div>
                                    {selectedOrder.tracking_number && (
                                        <>
                                            <Separator />
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Courier</span>
                                                    <span>{selectedOrder.courier_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Tracking #</span>
                                                    {selectedOrder.tracking_url_template ? (
                                                        <a
                                                            href={selectedOrder.tracking_url_template.replace('{tracking_number}', selectedOrder.tracking_number)}
                                                            target="_blank" rel="noreferrer"
                                                            className="text-blue-600 underline font-mono text-xs"
                                                        >
                                                            {selectedOrder.tracking_number}
                                                        </a>
                                                    ) : (
                                                        <span className="font-mono text-xs">{selectedOrder.tracking_number}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {selectedOrder.payment_proof && (
                                        <>
                                            <Separator />
                                            <button
                                                onClick={() => { setViewReceipt(selectedOrder.payment_proof); }}
                                                className="text-blue-600 underline text-sm flex items-center gap-1"
                                            >
                                                <FileText className="h-4 w-4" /> View Payment Receipt
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <div className="p-4 border-b bg-slate-50">
                                    <h4 className="font-semibold text-sm">Ordered Items</h4>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOrder.items?.map((item: any, i: number) => (
                                            <TableRow key={i}>
                                                <TableCell className="py-3">
                                                    <span className="font-medium">{item.product_name || 'Item'}</span>
                                                    {item.variant_options && (
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {Object.entries(
                                                                typeof item.variant_options === 'string'
                                                                    ? JSON.parse(item.variant_options)
                                                                    : item.variant_options
                                                            ).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right text-sm">
                                                    LKR {Number(item.unit_price).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    LKR {Number(item.line_total).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50">
                                            <TableCell colSpan={3} className="text-right font-bold">Order Total</TableCell>
                                            <TableCell className="text-right font-bold text-base">
                                                LKR {Number(selectedOrder.total_amount).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Quick Actions */}
                            {(String(selectedOrder.delivery_status).toUpperCase() === 'PENDING' || String(selectedOrder.delivery_status).toUpperCase() === 'PICKUP') &&
                                ['cod', 'cash on delivery', 'bank_transfer', 'bank transfer'].includes(String(selectedOrder.payment_method).toLowerCase()) && (
                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        onClick={() => handleConfirm(selectedOrder.id)}
                                        disabled={confirming === selectedOrder.id}
                                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                        size="lg"
                                    >
                                        {confirming === selectedOrder.id
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <CheckCircle className="h-4 w-4" />
                                        }
                                        Confirm & Approve Order
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
