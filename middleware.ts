import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "./lib/amplifyServerUtils";
import { isAdmin } from "./lib/session";

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  return await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (context) => {
      const session = await fetchAuthSession(context);
      const pathname = request.nextUrl.pathname;

      if (pathname.startsWith("/admin-dashboard") && !isAdmin(session)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (pathname.startsWith("/auth") && session.tokens) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (pathname.startsWith("/account") && !session.tokens) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      return response;
    },
  });
}

export const config = {
  matcher: ["/admin-dashboard/:path*", "/auth/:path*", "/account/:path*"],
};
