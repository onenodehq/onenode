import { auth } from "@/auth";

export default auth((req) => {
  const newUrl = new URL("/login", req.nextUrl.origin);
  return Response.redirect(newUrl);
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (static files in public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

export { auth as middleware } from "@/auth";
