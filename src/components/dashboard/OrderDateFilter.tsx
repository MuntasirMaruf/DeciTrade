"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Calendar, ChevronDown, X } from "lucide-react";

export default function OrderDateFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentDate = searchParams.get("date") || "";

    function handleDateChange(date: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (date) {
            params.set("date", date);
        } else {
            params.delete("date");
        }
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex items-center">
                {/* Left static Calendar icon (matches the Search bar design) */}
                <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />

                {/* Direct typable date input */}
                <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />

                {/* Right Chevron (the single button to trigger the calendar) */}
                <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {currentDate && (
                <button
                    type="button"
                    onClick={() => handleDateChange("")}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Clear date filter"
                >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                </button>
            )}
        </div>
    );
}