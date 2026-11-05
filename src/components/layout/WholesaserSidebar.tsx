"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package } from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/wholesaler/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/wholesaler/orders", icon: ShoppingBag },
    { label: "Inventory", href: "/wholesaler/inventory", icon: Package },
];

export default function WholesalerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 shrink-0 h-full border-r border-border bg-card overflow-y-auto flex flex-col justify-between">
            <div className="p-4">
                <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Wholesaler Menu
                </span>
                <nav className="mt-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        // usePathname() checks if this item is currently active:
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground px-3">
                    DeciTrade v1.0
                </div>
            </div>
        </aside>
    );
}