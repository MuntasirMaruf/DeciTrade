import Link from "next/link";
import { Package, Users, DollarSign } from "lucide-react";
import StatCard from "@/components/dashboard/StateCard";

export default function WholesalerDashboardPage() {
    const stats = [
        {
            title: "Total Orders",
            value: "142",
            change: "+12% this month",
            icon: Package,
        },
        {
            title: "Active Retailers",
            value: "38",
            change: "+4 new stores",
            icon: Users,
        },
        {
            title: "Gross Revenue",
            value: "$48,250",
            change: "+8.4% vs last week",
            icon: DollarSign,
        },
    ];

    return (
        <div className="mx-auto w-full p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Wholesaler Dashboard
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Monitor inventory, dispatch logistics, and retailer order requests.
                    </p>
                </div>

                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>

            {/* Clean Metrics Grid using our extracted component */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        change={stat.change}
                        icon={stat.icon}
                    />
                ))}
            </div>

            {/* Warehouse Status Card */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
                    Warehouse Status
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    All systems are operational. Incoming retailer orders are queued for dispatch.
                </p>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                    Tip: You can wire up your live product inventory and real-time order requests here.
                </div>
            </div>
        </div>
    );
}