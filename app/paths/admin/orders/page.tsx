"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter, FileText, Truck, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOnlineOrders, updateOrderStatus } from "@/server-actions/admin/orders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function OnlineOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [viewReceipt, setViewReceipt] = useState<string | null>(null);
    const { toast } = useToast();

    const [couriers, setCouriers] = useState<any[]>([]);
    const [shippingOrder, setShippingOrder] = useState<string | null>(null); // Order ID being shipped
    const [selectedCourier, setSelectedCourier] = useState<string>("");
    const [trackingNumber, setTrackingNumber] = useState("");

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

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (newStatus === "SHIPPED") {
            setShippingOrder(orderId);
            setTrackingNumber("");
            setSelectedCourier("");
            return;
        }
        await updateStatus(orderId, newStatus);
    };

    const updateStatus = async (orderId: string, status: string, courierId?: string, trackNo?: string) => {
        const result = await updateOrderStatus(orderId, status, courierId, trackNo);
        if (result.success) {
            toast({ title: "Status Updated" });
            loadData();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, delivery_status: status });
            }
        } else {
            toast({ title: "Failed to update status", variant: "destructive" });
        }
    };

    const confirmShipping = async () => {
        if (!shippingOrder) return;
        if (!selectedCourier) return toast({ title: "Select a courier", variant: "destructive" });
        if (!trackingNumber) return toast({ title: "Enter tracking number", variant: "destructive" });

        await updateStatus(shippingOrder, "SHIPPED", selectedCourier, trackingNumber);
        setShippingOrder(null);
    };

    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold tracking-tight">Online Orders</h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 items-center">
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
                </div>
                <Button variant="outline" onClick={loadData}>Refresh</Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">Loading orders...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">No online orders found.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono">{order.order_number}</TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-slate-500">{order.customer_phone}</div>
                                    </TableCell>
                                    <TableCell>LKR {Number(order.total_amount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {order.delivery_method === 'pickup' ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                                                <Store className="h-3 w-3" /> Pickup
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
                                                <Truck className="h-3 w-3" /> Delivery
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{order.payment_method}</Badge>
                                            {order.payment_proof && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewReceipt(order.payment_proof)}>
                                                    <FileText className="h-3 w-3 text-blue-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.delivery_status}
                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                        >
                                            <SelectTrigger className={`h-8 w-[130px] text-xs font-semibold
                                                ${order.delivery_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    order.delivery_status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        order.delivery_status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {order.delivery_status === 'SHIPPED' && order.tracking_number && (
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {order.courier_name}: {
                                                    order.tracking_url_template ? (
                                                        <a
                                                            href={order.tracking_url_template.replace('{tracking_number}', order.tracking_number)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 underline hover:text-blue-800"
                                                        >
                                                            {order.tracking_number}
                                                        </a>
                                                    ) : (
                                                        <span>{order.tracking_number}</span>
                                                    )
                                                }
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
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
                    <div className="flex justify-center bg-slate-100 p-4 rounded min-h-[300px]">
                        {viewReceipt && (
                            <img src={viewReceipt} alt="Receipt" className="max-w-full max-h-[600px] object-contain" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Ship Order Dialog */}
            <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ship Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Courier</label>
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
                                placeholder="Enter tracking Number"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShippingOrder(null)}>Cancel</Button>
                        <Button onClick={confirmShipping}>Confirm Shipment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded border">
                                    <h4 className="font-semibold mb-2 text-sm text-slate-500 uppercase">Customer</h4>
                                    <p className="font-bold">{selectedOrder.customer_name}</p>
                                    <p>{selectedOrder.customer_phone}</p>
                                    <p>{selectedOrder.customer_email}</p>
                                    <p className="whitespace-pre-wrap">{selectedOrder.shipping_address}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border">
                                    <h4 className="font-semibold mb-2 text-sm text-slate-500 uppercase">Payment & Status</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Method:</span>
                                            <span className="font-medium uppercase">{selectedOrder.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Current Status:</span>
                                            <Badge>{selectedOrder.delivery_status}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Order Date:</span>
                                            <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.tracking_number && (
                                            <div className="mt-2 pt-2 border-t">
                                                <div className="font-semibold text-slate-700">Tracking Info</div>
                                                <div className="flex justify-between">
                                                    <span>Courier:</span>
                                                    <span>{selectedOrder.courier_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tracking #:</span>
                                                    <span className="font-mono">{selectedOrder.tracking_number}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedOrder.payment_proof && (
                                            <div className="pt-2">
                                                <a href={selectedOrder.payment_proof} target="_blank" className="text-blue-600 underline text-xs">View Uploaded Receipt</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Ordered Items</h4>
                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Item</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items?.map((item: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-2">
                                                        <span className="text-sm font-medium">{item.product_name || 'Item'}</span>
                                                        {item.variant_options && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {Object.entries(typeof item.variant_options === 'string' ? JSON.parse(item.variant_options) : item.variant_options)
                                                                    .map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right py-2">{item.quantity}</TableCell>
                                                    <TableCell className="text-right py-2">
                                                        {Number(item.line_total).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-slate-50 font-bold">
                                                <TableCell colSpan={2}>Total Amount</TableCell>
                                                <TableCell className="text-right">
                                                    LKR {Number(selectedOrder.total_amount).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
