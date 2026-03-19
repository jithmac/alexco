"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruitmentPage() {
    // Placeholder UI for Recruitment
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Recruitment & Onboarding</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Job Vacancies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500 mb-4">Manage open positions and publish to careers page.</p>
                        <Button variant="outline" className="w-full">Manage Vacancies</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Checklists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500 mb-4">Track onboarding progress for new hires.</p>
                        <Button variant="outline" className="w-full">View Progress</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
