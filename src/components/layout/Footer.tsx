export default function Footer() {
    return (
        <footer className="border-t border-border bg-footer py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-footer-foreground">
                <p>© {new Date().getFullYear()} DeciTrade. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Support</a>
                </div>
            </div>
        </footer>
    );
}