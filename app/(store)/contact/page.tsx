"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/server-actions/public/contact";

export default function ContactPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.email || !formData.message) {
            toast({
                title: "Missing Information",
                description: "Please fill in your name, email, and message.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        const result = await submitContactForm(formData);
        setLoading(false);

        if (result.success) {
            setSubmitted(true);
            toast({ title: "Message Sent!", description: "We'll get back to you soon." });
        } else {
            toast({
                title: "Failed to Send",
                description: result.error || "Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Contact Us</h1>
            <p className="text-slate-600 mb-10">We're here to help. Reach out to us for any inquiries or support.</p>

            <div className="grid md:grid-cols-3 gap-12">
                {/* Contact Information */}
                <div className="md:col-span-1 space-y-8">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                123 Main Street,<br />
                                Colombo 03, Sri Lanka
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                            <p className="text-slate-600 text-sm">
                                <a href="tel:+94112345678" className="hover:text-blue-600 transition-colors">+94 11 234 5678</a><br />
                                <a href="tel:+94771234567" className="hover:text-blue-600 transition-colors">+94 77 123 4567</a>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                            <p className="text-slate-600 text-sm">
                                <a href="mailto:sales@alexco.lk" className="hover:text-blue-600 transition-colors">sales@alexco.lk</a><br />
                                <a href="mailto:support@alexco.lk" className="hover:text-blue-600 transition-colors">support@alexco.lk</a>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Opening Hours</h3>
                            <p className="text-slate-600 text-sm">
                                Mon - Fri: 8:30 AM - 5:30 PM<br />
                                Sat: 9:00 AM - 2:00 PM<br />
                                Sun: Closed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-sm">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="bg-green-50 p-6 rounded-full h-20 w-20 mx-auto flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                            <p className="text-slate-600 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                            <Button onClick={() => { setSubmitted(false); setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" }); }}>
                                Send Another Message
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">First Name *</label>
                                        <Input
                                            name="firstName"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Last Name</label>
                                        <Input
                                            name="lastName"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email Address *</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Subject</label>
                                    <Input
                                        name="subject"
                                        placeholder="Inquiry about solar systems..."
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Message *</label>
                                    <Textarea
                                        name="message"
                                        placeholder="How can we help you?"
                                        className="min-h-[150px]"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-10 md:mt-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[280px] md:h-[400px] bg-slate-100 relative">
                <iframe
                    src="https://maps.google.com/maps?q=7.013340473175049,79.96552276611328&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Alexco Location"
                ></iframe>
            </div>
        </div>
    );
}
