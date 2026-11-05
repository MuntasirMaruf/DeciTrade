import Link from "next/link";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";

export type VerificationBannerStatus = "INCOMPLETE" | "PENDING_REVIEW";

interface OnboardingBannerProps {
    status: VerificationBannerStatus;
}

export default function OnboardingBanner({ status }: OnboardingBannerProps) {
    if (status === "PENDING_REVIEW") {
        return (
            <aside
                aria-label="Verification pending notice"
                className="border-b border-sky-500/20 bg-sky-500/10 px-6 py-2.5 text-xs text-sky-800 dark:text-sky-200"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span className="truncate font-medium">
                            Account verification pending. An admin will verify your account within 24 hours.
                        </span>
                    </div>
                    <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                        Under Review
                    </span>
                </div>
            </aside>
        );
    }

    // Default: INCOMPLETE
    return (
        <aside
            aria-label="Account setup notice"
            className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2.5 text-xs text-amber-800 dark:text-amber-200"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="truncate font-medium">
                        Account setup incomplete: Add your business address and trade license to unlock full trading features.
                    </span>
                </div>
                <Link
                    href="/onboarding"
                    className="inline-flex shrink-0 items-center gap-1 font-semibold underline hover:no-underline"
                >
                    <span>Complete Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </aside>
    );
}