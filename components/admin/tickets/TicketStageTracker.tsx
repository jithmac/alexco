
import { Check, CircleDot, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
    { id: 'RECEIVED', label: 'Received' },
    { id: 'INSPECTION', label: 'Inspection' },
    { id: 'DIAGNOSIS', label: 'Diagnosis' },
    { id: 'WAITING_APPROVAL', label: 'Approval' },
    { id: 'IN_REPAIR', label: 'Repairing' },
    { id: 'TESTING', label: 'QA Test' },
    { id: 'CLEANING', label: 'Cleaning' },
    { id: 'BILLING', label: 'Billing' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'CLOSED', label: 'Closed' }
];

export function TicketStageTracker({ currentStage }: { currentStage: string }) {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className="w-full overflow-x-auto py-2">
            <div className="flex items-center min-w-max px-2">
                {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                        <div key={stage.id} className="flex items-center">
                            <div className="flex flex-col items-center gap-1 relative">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white",
                                    isCompleted ? "border-blue-600 bg-blue-600 text-white" :
                                        isCurrent ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-300"
                                )}>
                                    {isCompleted ? <Check className="w-5 h-5" /> :
                                        isCurrent ? <CircleDot className="w-5 h-5" /> :
                                            <span className="text-xs font-mono">{idx + 1}</span>}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium whitespace-nowrap absolute -bottom-6",
                                    isCurrent ? "text-blue-600 font-bold" : "text-slate-500"
                                )}>
                                    {stage.label}
                                </span>
                            </div>

                            {idx < STAGES.length - 1 && (
                                <div className={cn(
                                    "w-8 h-1 mx-1",
                                    idx < currentIndex ? "bg-blue-600" : "bg-slate-200"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
