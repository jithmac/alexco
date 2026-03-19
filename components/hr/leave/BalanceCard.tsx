import { Card, CardContent } from "@/components/ui/card";

interface BalanceCardProps {
    type: string;
    balance: number;
    taken: number;
}

export function BalanceCard({ type, balance, taken }: BalanceCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="text-sm text-slate-500 font-medium">{type}</div>
                <div className="text-2xl font-bold mt-2">
                    {balance - taken} <span className="text-sm font-normal text-slate-400">/ {balance} Days</span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${Math.min((taken / balance) * 100, 100)}%` }}></div>
                </div>
                <div className="text-xs text-right mt-1 text-slate-400">{taken} Used</div>
            </CardContent>
        </Card>
    );
}
