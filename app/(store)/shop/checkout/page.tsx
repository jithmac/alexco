"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Truck, Store, Trash2, Plus, Minus } from "lucide-react";
import { createOnlineOrder } from "@/server-actions/shop/checkout";
import { calculateDeliveryCost } from "@/server-actions/store/checkout";
import { generatePayHereHash } from "@/server-actions/payment/payhere";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/hooks/use-cart";

export default function CheckoutPage() {
    const { items, total, clearCart, removeItem, updateQuantity } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [orderId, setOrderId] = useState("");

    // Delivery State
    const [deliveryCost, setDeliveryCost] = useState(0);
    const [totalWeight, setTotalWeight] = useState(0);
    // const [itemWeights, setItemWeights] = useState<Record<string, number>>({});
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
    const [itemWeights, setItemWeights] = useState<Record<string, { unitWeight: number; lineWeight: number }>>({});

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    useEffect(() => {
        async function fetchDelivery() {
            if (items.length === 0) return;
            try {
                // Pass items. use item.productId if available, else item.id
                const payload = items.map(i => ({
                    id: String(i.productId || i.id),
                    quantity: i.quantity
                }));
                const result = await calculateDeliveryCost(payload);
                setDeliveryCost(result.cost);
                setTotalWeight(result.weight);

                // Store per-item weights
                const weights: Record<string, { unitWeight: number; lineWeight: number }> = {};
                result.details.forEach((d: any) => {
                    weights[d.id] = { unitWeight: d.unitWeight, lineWeight: d.lineWeight };
                });
                setItemWeights(weights);
            } catch (e) {
                console.error(e);
            }
        }
        fetchDelivery();
    }, [items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast({ title: "Cart is empty", variant: "destructive" });
            return;
        }

        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            toast({
                title: "Missing Details",
                description: "Please fill in all required fields (Name, Phone, Address, City).",
                variant: "destructive"
            });
            return;
        }

        if (paymentMethod === 'bank_transfer' && !receiptFile) {
            toast({ title: "Please upload payment receipt", variant: "destructive" });
            return;
        }

        setLoading(true);

        const finalDeliveryCost = deliveryMethod === 'pickup' ? 0 : deliveryCost;
        const finalTotal = total + finalDeliveryCost;

        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("phone", formData.phone);
        submitData.append("email", formData.email);
        submitData.append("address", `${formData.address}, ${formData.city}`);
        submitData.append("paymentMethod", paymentMethod);

        // Pass items including variations
        // Store expects specific format? No, createOnlineOrder just parses.
        // We ensure productId is set.
        const itemsToSubmit = items.map(i => ({
            id: i.productId || i.id, // The real product ID
            productId: i.productId || i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variations: i.variations // Passing variations
        }));

        submitData.append("items", JSON.stringify(itemsToSubmit));
        submitData.append("total", finalTotal.toString());
        submitData.append("deliveryMethod", deliveryMethod); // Need to handle this in server action if needed

        if (receiptFile) {
            submitData.append("receipt", receiptFile);
        }

        const result = await createOnlineOrder(submitData);

        if (result.success) {
            setOrderId(result.orderNumber!);

            if (paymentMethod === 'payhere') {
                // Initiate PayHere Payment
                try {
                    const { hash, merchantId, amountFormatted } = await generatePayHereHash(result.orderNumber!, finalTotal, "LKR");

                    const payment = {
                        sandbox: process.env.NEXT_PUBLIC_PAYHERE_MODE === "sandbox",
                        merchant_id: merchantId,
                        return_url: `${window.location.origin}/shop/orders/${result.orderNumber}`,
                        cancel_url: `${window.location.origin}/shop/checkout`,
                        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payhere/notify`,
                        order_id: result.orderNumber,
                        items: items.map(i => i.name).join(", "),
                        amount: amountFormatted, // Use formatted amount
                        currency: "LKR",
                        hash: hash,
                        first_name: formData.name.split(" ")[0],
                        last_name: formData.name.split(" ").slice(1).join(" ") || formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        country: "Sri Lanka",
                        delivery_address: formData.address,
                        delivery_city: formData.city,
                        delivery_country: "Sri Lanka",
                    };

                    if ((window as any).payhere) {
                        (window as any).payhere.startPayment(payment);

                        (window as any).payhere.onCompleted = function onCompleted(orderId: string) {
                            console.log("Payment completed. OrderID:" + orderId);
                            setStep('success');
                            clearCart();
                            toast({ title: "Payment Successful!" });
                        };

                        (window as any).payhere.onDismissed = function onDismissed() {
                            // Order is created but payment dismissed.
                            console.log("Payment dismissed");
                            toast({
                                title: "Payment Cancelled",
                                description: "You cancelled the payment process. The order has been created but not paid.",
                                variant: "destructive"
                            });
                            // Do NOT set success or clear cart, so user can try again or choose another method.
                            // Ideally we might want to let them pay for the EXISTING orderId, but simpler logic for now:
                            // They remain on checkout. If they click Place Order again, it might create a duplicate pending order.
                            // To prevent duplicate order creation if they retry immediately:
                            // We could store orderId and check if it exists? 
                            // For now, just preventing the "Success" screen is the critical fix.
                        };

                        (window as any).payhere.onError = function onError(error: any) {
                            console.log("Error:" + error);
                            toast({
                                title: "Payment Error",
                                description: "An error occurred during payment initiation. Please check your configuration.",
                                variant: "destructive"
                            });
                        };
                    } else {
                        alert("PayHere SDK not loaded.");
                    }

                } catch (e) {
                    console.error("PayHere Init Error:", e);
                    toast({ title: "Failed to initiate payment", variant: "destructive" });
                }
            } else {
                setStep('success');
                clearCart();
                toast({ title: "Order Placed Successfully!" });
            }
        } else {
            toast({
                title: "Order Failed",
                description: result.error || "Something went wrong.",
                variant: "destructive"
            });
        }
        setLoading(false);
    };

    if (step === 'success') {
        return (
            <div className="container max-w-lg mx-auto py-20 px-4 text-center">
                <div className="bg-green-50 p-8 rounded-full h-24 w-24 mx-auto flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                <p className="text-muted-foreground mb-8">
                    Your order <strong>#{orderId}</strong> has been placed successfully.
                    We will contact you shortly to confirm delivery.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const finalTotal = deliveryMethod === 'delivery' ? total + deliveryCost : total;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <RadioGroupItem value="delivery" id="delivery" />
                                    <Label htmlFor="delivery" className="flex-1 flex items-center gap-3 cursor-pointer">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <div className="font-semibold">Standard Delivery</div>
                                            <div className="text-xs text-slate-500">
                                                Total Weight: {(totalWeight / 1000).toFixed(2)}kg
                                            </div>
                                        </div>
                                        <div className="font-bold">LKR {deliveryCost.toLocaleString()}</div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <RadioGroupItem value="pickup" id="pickup" />
                                    <Label htmlFor="pickup" className="flex-1 flex items-center gap-3 cursor-pointer">
                                        <Store className="h-5 w-5 text-green-600" />
                                        <div className="flex-1">
                                            <div className="font-semibold">Store Pickup</div>
                                            <div className="text-xs text-slate-500">Collect from Colombo 03</div>
                                        </div>
                                        <div className="font-bold text-green-600">Free</div>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {/* Weight Breakdown */}
                            {deliveryMethod === 'delivery' && Object.keys(itemWeights).length > 0 && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                    <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase">Weight Breakdown</h4>
                                    <div className="space-y-1 text-xs">
                                        {items.map((item, idx) => {
                                            const key = item.productId || item.id;
                                            const weight = itemWeights[key];
                                            return weight ? (
                                                <div key={idx} className="flex justify-between text-slate-600">
                                                    <span className="truncate flex-1 min-w-0">{item.name} x{item.quantity}</span>
                                                    <span className="font-medium">{(weight.lineWeight / 1000).toFixed(2)}kg</span>
                                                </div>
                                            ) : null;
                                        })}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-semibold text-slate-800">
                                            <span>Total Weight</span>
                                            <span>{(totalWeight / 1000).toFixed(2)}kg</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-blue-600">
                                            <span>Delivery Charge</span>
                                            <span>LKR {deliveryCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input id="phone" name="phone" required value={formData.phone} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input id="address" name="address" required value={formData.address} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input id="city" name="city" required value={formData.city} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                {/* COD */}
                                <div className="flex items-start space-x-3 border p-4 rounded-md">
                                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                                    <div className="space-y-1">
                                        <Label htmlFor="cod" className="font-semibold cursor-pointer">Cash on Delivery</Label>
                                        <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                                    </div>
                                </div>

                                {/* Bank Transfer */}
                                <div className="border p-4 rounded-md">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <RadioGroupItem value="bank_transfer" id="bank" />
                                        <Label htmlFor="bank" className="font-semibold cursor-pointer">Bank Transfer</Label>
                                    </div>
                                    {paymentMethod === 'bank_transfer' && (
                                        <div className="ml-7 mt-3 p-3 bg-slate-50 rounded text-sm space-y-3">
                                            <div className="text-slate-700">
                                                <p className="font-semibold">Bank: Commercial Bank</p>
                                                <p>Account: Alexco Engineering</p>
                                                <p>Account No: 1234567890</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Upload Receipt/Slip *</Label>
                                                <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PayHere */}
                                <div className="border p-4 rounded-md">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="payhere" id="payhere" />
                                        <Label htmlFor="payhere" className="font-semibold cursor-pointer">PayHere (Online Payment)</Label>
                                    </div>
                                    <div className="ml-7 text-sm text-muted-foreground">
                                        Visa, MasterCard, eZ Cash, Frimi, etc.
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="lg:sticky lg:top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Your cart is empty
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                                            <div className="relative w-12 h-12 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized={item.image.startsWith('/uploads')}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium line-clamp-1">{item.name}</span>
                                                    <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-end mt-1">
                                                    <div className="text-xs text-muted-foreground">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        {item.variations && (
                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                {Object.entries(item.variations).map(([k, v]) => (
                                                                    <span key={k} className="bg-slate-100 px-1 rounded">{k}:{v}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {itemWeights[item.productId || item.id] && (
                                                            <div className="mt-1 text-slate-400">
                                                                Weight: {(itemWeights[item.productId || item.id].lineWeight / 1000).toFixed(2)}kg
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => removeItem(item.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>LKR {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Delivery</span>
                                    <span>{deliveryMethod === 'delivery' ? `LKR ${deliveryCost.toLocaleString()}` : 'Free'}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>LKR {finalTotal.toLocaleString()}</span>
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full h-12 text-lg"
                                onClick={handleSubmit}
                                disabled={loading || items.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    `Place Order`
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
