import { NextResponse } from "next/server";

const isProtectedPath = (pathname) => {
  if (pathname.startsWith("/api/login") || pathname.startsWith("/login")) {
    return false;
  }
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return false;
  }
  return pathname === "/" || pathname.startsWith("/api/") || pathname.startsWith("/images/");
};

export const middleware = (request) => {
  const authUser = process.env.AUTH_USER || "";
  const authPass = process.env.AUTH_PASS || "";

  if (!authUser && !authPass) {
    return NextResponse.next();
  }
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const sessionUser = request.cookies.get("session_user")?.value;
  if (sessionUser === authUser) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
};

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
