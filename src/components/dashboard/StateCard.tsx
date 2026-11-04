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
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {title}
                </span>
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-1">
                {value}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{change}</span>
            </div>
        </div>
    );
}