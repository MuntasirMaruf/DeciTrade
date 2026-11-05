import Link from "next/link";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import OrderSearch from "@/components/dashboard/OrderSearch";
import OrderDateFilter from "@/components/dashboard/OrderDateFilter";

// 1. Strict TypeScript definition for an Order record
interface Order {
    id: string;
    retailer: string;
    date: string;
    itemsCount: number;
    totalAmount: string;
    status: "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED";
}

// 2. Realistic B2B Mock Order Dataset
const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-9021",
        retailer: "Metro Supermarket",
        date: "Nov 5, 2026",
        itemsCount: 140,
        totalAmount: "$4,850.00",
        status: "PENDING",
    },
    {
        id: "ORD-9020",
        retailer: "QuickStop Convenience",
        date: "Nov 4, 2026",
        itemsCount: 45,
        totalAmount: "$1,220.50",
        status: "PROCESSING",
    },
    {
        id: "ORD-9019",
        retailer: "Apex Grocery Mart",
        date: "Nov 3, 2026",
        itemsCount: 210,
        totalAmount: "$8,940.00",
        status: "DELIVERED",
    },
    {
        id: "ORD-9018",
        retailer: "Cornerstone Foods",
        date: "Nov 2, 2026",
        itemsCount: 60,
        totalAmount: "$1,980.00",
        status: "DELIVERED",
    },
    {
        id: "ORD-9017",
        retailer: "GreenValley Organics",
        date: "Nov 1, 2026",
        itemsCount: 15,
        totalAmount: "$430.00",
        status: "CANCELLED",
    },
];

const FILTER_TABS = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

// Helper to style status badges cleanly
function getStatusBadge(status: Order["status"]) {
    const styles = {
        PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        CANCELLED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
        >
            {status}
        </span>
    );
}

// 3. Next.js 15+ Async Page Props
interface PageProps {
    searchParams: Promise<{
        status?: string;
        query?: string;
        date?: string;
    }>;
}

export default async function WholesalerOrdersPage({ searchParams }: PageProps) {
    // Await searchParams directly on the server
    const { status, query, date } = await searchParams;
    const currentStatus = (status || "ALL").toUpperCase();
    const searchQuery = (query || "").toLowerCase();
    const filterDate = date || "";

    // Helper to format "Nov 5, 2026" to "2026-11-05" without timezone skew
    function formatToISODate(dateStr: string) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Combined Server-Side Filtering (Status + Search Query + Date)
    const filteredOrders = MOCK_ORDERS.filter((order) => {
        const matchesStatus =
            currentStatus === "ALL" || order.status === currentStatus;
        const matchesQuery =
            !searchQuery ||
            order.retailer.toLowerCase().includes(searchQuery) ||
            order.id.toLowerCase().includes(searchQuery);
        const matchesDate =
            !filterDate || formatToISODate(order.date) === filterDate;
        return matchesStatus && matchesQuery && matchesDate;
    });
    return (
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Management</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Orders
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track and manage wholesale orders placed by your retail network.
                    </p>
                </div>
            </div>

            {/* Search Bar & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <Suspense fallback={<div className="h-9 w-full max-w-sm rounded-lg bg-muted animate-pulse" />}>
                    <OrderSearch />
                </Suspense>

                <Suspense fallback={<div className="h-9 w-44 rounded-lg bg-muted animate-pulse" />}>
                    <OrderDateFilter />
                </Suspense>
            </div>

            {/* Filter Tabs (Standard Declarative Links) */}
            <div className="flex items-center gap-1.5 border-b border-border pb-3 mb-6 overflow-x-auto">
                {FILTER_TABS.map((tab) => {
                    const isActive = currentStatus === tab.value;
                    const href =
                        tab.value === "ALL"
                            ? "/wholesaler/orders"
                            : `/wholesaler/orders?status=${tab.value}`;

                    return (
                        <Link
                            key={tab.value}
                            href={href}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${isActive
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            {/* Orders Data Table */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3.5">Order ID</th>
                                <th className="px-6 py-3.5">Retailer</th>
                                <th className="px-6 py-3.5">Date</th>
                                <th className="px-6 py-3.5">Items</th>
                                <th className="px-6 py-3.5">Total</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-muted-foreground text-sm"
                                    >
                                        No orders found with status &ldquo;{currentStatus}&rdquo;.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono font-semibold text-foreground text-xs">
                                            {order.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {order.retailer}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {order.date}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {order.itemsCount} units
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            {order.totalAmount}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                <span>Details</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}