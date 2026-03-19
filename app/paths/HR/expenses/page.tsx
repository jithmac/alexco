"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, DollarSign } from "lucide-react";

export default function ExpensesPage() {
    // Placeholder UI for Field Force Expenses
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Field Expenses & Claims</h1>
            <div className="flex justify-end">
                <Button><Plus className="h-4 w-4 mr-2" /> New Claim</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Claims</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-slate-400 py-8">
                        No expense claims submitted yet.
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Batta Allowances</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-slate-400 py-8">
                        No allowances calculated for this month.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
