export default function WholesalerInventoryPage() {
    return (
        <div className="mx-auto w-full p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Inventory Management
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Monitor inventory, dispatch logistics, and retailer order requests.
                    </p>
                </div>
            </div>
        </div>
    );
}