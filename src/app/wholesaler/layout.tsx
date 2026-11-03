export default function WholesalerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
            {/* Wholesaler child pages (Dashboard, Orders, Inventory, etc.) */}
            <div className="flex-1">{children}</div>
        </div>
    );
}