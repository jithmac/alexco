"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayAttendance, clockIn, clockOut } from "@/server-actions/hr/attendance";
import { MapPin, Clock, LogIn, LogOut, Loader2 } from "lucide-react";

export default function ClockInPage() {
    const [attendance, setAttendance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    async function loadStatus() {
        setLoading(true);
        const status = await getTodayAttendance();
        setAttendance(status);
        setLoading(false);
    }

    useEffect(() => {
        loadStatus();

        // Get geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setLocationError("Unable to retrieve location. Please enable GPS.")
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
        }
    }, []);

    async function handleClockIn() {
        setActionLoading(true);
        const res = await clockIn({
            latitude: location?.lat,
            longitude: location?.lng,
            source: 'mobile'
        });
        if (res.success) loadStatus();
        setActionLoading(false);
    }

    async function handleClockOut() {
        setActionLoading(true);
        const res = await clockOut({
            latitude: location?.lat,
            longitude: location?.lng,
            source: 'mobile'
        });
        if (res.success) loadStatus();
        setActionLoading(false);
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading status...</div>;

    const isClockedIn = attendance && attendance.check_in && !attendance.check_out;
    const isClockedOut = attendance && attendance.check_out;

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center text-slate-900">Attendance</h1>

            <Card className="shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-slate-500 text-sm uppercase tracking-wider">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </CardTitle>
                    <div className="text-4xl font-bold text-slate-900 mt-2 font-mono">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Location Status */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <MapPin className={`h-4 w-4 ${location ? 'text-green-500' : 'text-red-500'}`} />
                        {location ? (
                            <span className="text-green-600">GPS Location Acquired</span>
                        ) : (
                            <span className="text-red-500">{locationError || "Locating..."}</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-4">
                        {!attendance ? (
                            <Button
                                size="lg"
                                className="h-16 text-lg bg-green-600 hover:bg-green-700"
                                onClick={handleClockIn}
                                disabled={actionLoading || !location}
                            >
                                {actionLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <LogIn className="h-6 w-6 mr-2" />}
                                CLOCK IN
                            </Button>
                        ) : isClockedIn ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                                    <div className="font-semibold">Clocked In at</div>
                                    <div className="text-xl">{new Date(attendance.check_in).toLocaleTimeString()}</div>
                                </div>
                                <Button
                                    size="lg"
                                    className="h-16 text-lg w-full bg-red-600 hover:bg-red-700"
                                    onClick={handleClockOut}
                                    disabled={actionLoading || !location}
                                >
                                    {actionLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <LogOut className="h-6 w-6 mr-2" />}
                                    CLOCK OUT
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center space-y-2">
                                <div className="flex justify-between px-4">
                                    <span>In: {new Date(attendance.check_in).toLocaleTimeString()}</span>
                                    <span>Out: {new Date(attendance.check_out).toLocaleTimeString()}</span>
                                </div>
                                <div className="font-bold border-t border-blue-200 pt-2 mt-2">
                                    Shift Complete ✅
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Summary */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm text-slate-500">
                <div className="bg-white p-3 rounded-lg border">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <div>Standard Shift</div>
                    <div className="font-semibold text-slate-900">08:00 - 17:00</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                    <MapPin className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <div>Assigned Site</div>
                    <div className="font-semibold text-slate-900">Main Office</div>
                </div>
            </div>
        </div>
    );
}
