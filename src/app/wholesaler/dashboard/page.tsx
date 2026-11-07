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
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Wholesaler Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor inventory, dispatch logistics, and retailer order requests.
                    </p>
                </div>

                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm"
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
            <div className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                <h2 className="text-lg font-bold tracking-tight text-card-foreground mb-2">
                    Warehouse Status
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    All systems are operational. Incoming retailer orders are queued for dispatch.
                </p>
                <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                    Tip: You can wire up your live product inventory and real-time order requests here.
                </div>
            </div>
        </div>
    );
}