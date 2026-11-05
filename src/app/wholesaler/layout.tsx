import Header from "@/components/layout/Header";
import WholesalerSidebar from "@/components/layout/WholesaserSidebar";

export default function WholesalerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Header locked at the top */}
            <Header />
            {/* Portal Body Shell (fills remaining screen height) */}
            <div className="flex flex-1 overflow-hidden bg-neutral-50 dark:bg-black">
                {/* Sidebar: fills height, cannot scroll with page */}
                <WholesalerSidebar />
                {/* Content Area: ONLY this container scrolls */}
                <div className="flex-1 h-full overflow-y-auto min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
