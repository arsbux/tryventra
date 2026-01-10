import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // PROTECTED ROUTES: /desk
    if (request.nextUrl.pathname.startsWith("/desk")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("next", request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }

        // Check subscription status
        const { data: sub } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle();

        const hasActiveSub = sub?.status === 'active' || sub?.status === 'trialing';

        if (!hasActiveSub) {
            // Redirect to pricing if they don't have a valid subscription
            const url = request.nextUrl.clone();
            url.pathname = "/pricing";
            // Optional: add a query param to show a message on pricing page
            url.searchParams.set("error", "subscription_required");
            return NextResponse.redirect(url);
        }
    }

    // AUTH ROUTES: /login
    // Redirect to desk if already logged in (and subscribed)
    if (request.nextUrl.pathname.startsWith("/login")) {
        if (user) {
            const url = request.nextUrl.clone();
            url.pathname = "/desk";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/desk/:path*",
        "/login",
    ],
};
