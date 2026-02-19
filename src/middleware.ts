import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is authenticated and trying to access login, redirect to dashboard
    if (
      req.nextUrl.pathname === "/login" &&
      req.nextauth.token
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page even if not authenticated
        if (req.nextUrl.pathname === "/login") {
          return true
        }
        // Require token for all other protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
