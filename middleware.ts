import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ["/dashboard", "/lobby", "/match", "/deploy", "/admin", "/moderator"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If it's NOT a protected route, we can skip the heavy auth check
  // But we still might want to refresh cookies if a session exists.
  // However, to speed up compilation and execution, let's be more surgical.
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

function createClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lobby/:path*",
    "/match/:path*",
    "/deploy/:path*",
    "/admin/:path*",
    "/moderator/:path*",
  ],
};
