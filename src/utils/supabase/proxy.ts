import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 1. THIS REFRESHES THE TOKEN AND WRITES IT TO COOKIES
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 2. PROTECT PORTAL ROUTES: Redirect unauthenticated users to /login
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/wholesaler") ||
        request.nextUrl.pathname.startsWith("/retailer");

    // Helper to carry over refreshed cookies during redirects
    function redirectTo(path: string) {
        const url = request.nextUrl.clone();
        url.pathname = path;
        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
        return redirectResponse;
    }

    // 1. If not logged in, bounce to /login
    if (!user && isProtectedRoute) {
        return redirectTo("/login");
    }

    // 2. If logged in, enforce role boundaries
    if (user) {
        const role = user.user_metadata?.role as "WHOLESALER" | "RETAILER";

        // If a Retailer tries to view Wholesaler pages, kick them to Retailer dashboard
        if (role === "RETAILER" && request.nextUrl.pathname.startsWith("/wholesaler")) {
            return redirectTo("/retailer/dashboard");
        }

        // If a Wholesaler tries to view Retailer pages, kick them to Wholesaler dashboard
        if (role === "WHOLESALER" && request.nextUrl.pathname.startsWith("/retailer")) {
            return redirectTo("/wholesaler/dashboard");
        }
    }

    return supabaseResponse;
}