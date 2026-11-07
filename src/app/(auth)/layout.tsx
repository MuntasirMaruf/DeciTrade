import AuthHeader from "@/components/layout/AuthHeader";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 flex-col">
            <AuthHeader />
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-8 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}