import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
}

export default function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
    return (
        <div className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </span>
                <div className="p-2 rounded-lg bg-muted text-foreground">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-3xl font-extrabold text-card-foreground mb-1">
                {value}
            </div>
            <div className="flex items-center gap-1 text-xs text-accent font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{change}</span>
            </div>
        </div>
    );
}