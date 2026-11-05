"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function OrderSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    function handleSearch(term: string) {
        // 1. Copy the existing URL parameters so we don't erase ?status=PENDING
        const params = new URLSearchParams(searchParams.toString());

        // 2. Set or delete the query param based on input
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }

        // 3. Update the URL in-place without adding every keystroke to browser history
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Search by retailer or Order ID..."
                defaultValue={searchParams.get("query")?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
        </div>
    );
}