"use client";

import { useEffect, useState, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchOrders } from "@/server-actions/pos/orders";
import { Printer, RefreshCw, Search, ChevronLeft, ChevronRight, Calendar, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    status: string;
}

export default function OrderHistorySheet({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(""); // Debounced value
    const [searchInput, setSearchInput] = useState(""); // Input value
    const [sortBy, setSortBy] = useState<"created_at" | "total_amount">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [dateFilter, setDateFilter] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await searchOrders({
                page,
                limit: 20,
                search,
                sortBy,
                sortOrder,
                date: dateFilter || undefined
            });
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotalCount(data.total);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, sortBy, sortOrder, dateFilter]);

    // Initial load and reload when filters change
    useEffect(() => {
        if (open) {
            loadOrders();
        }
    }, [open, loadOrders]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handlePrint = (orderNumber: string) => {
        window.open(`/paths/POS/print/${orderNumber}`, '_blank', 'width=400,height=600');
    };

    const handleSortChange = (value: string) => {
        if (value === "date_desc") {
            setSortBy("created_at");
            setSortOrder("desc");
        } else if (value === "date_asc") {
            setSortBy("created_at");
            setSortOrder("asc");
        } else if (value === "amount_desc") {
            setSortBy("total_amount");
            setSortOrder("desc");
        } else if (value === "amount_asc") {
            setSortBy("total_amount");
            setSortOrder("asc");
        }
        setPage(1); // Reset to page 1 on sort change
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:max-w-[600px] flex flex-col h-full bg-slate-50">
                <SheetHeader className="space-y-4 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Receipt History</SheetTitle>
                        <Button variant="ghost" size="icon" onClick={() => loadOrders()} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search Order #"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-8 bg-white"
                            />
                        </div>
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-[140px] bg-white"
                        />
                        <Select
                            defaultValue="date_desc"
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="w-[130px] bg-white">
                                <ArrowUpDown className="mr-2 h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date_desc">Newest First</SelectItem>
                                <SelectItem value="date_asc">Oldest First</SelectItem>
                                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-3">
                    {loading && orders.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                            <Search className="h-8 w-8 opacity-50" />
                            <p>No receipts found</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all mx-1"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono font-bold text-slate-900 truncate text-base">
                                            {order.order_number}
                                        </span>
                                        <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 font-normal">
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.created_at).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 mr-4">
                                    <div className="text-base font-bold text-slate-900">
                                        LKR {Number(order.total_amount).toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                                        {order.payment_method}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                    onClick={() => handlePrint(order.order_number)}
                                    title="Reprint Receipt"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t mt-auto bg-slate-50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
                        <span>Total: <strong>{totalCount}</strong> receipts</span>
                        <span>Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong></span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="flex-1 bg-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="flex-1 bg-white"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
