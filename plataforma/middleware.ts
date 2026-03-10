import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/professor", "/aluno", "/gestor", "/suporte"];
const AUTH_PATHS = ["/auth/login", "/auth/callback"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // Se o Supabase redirecionar para a raiz com ?code=..., enviar para o callback
  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.pathname === "/" && code) {
    const callback = new URL("/auth/callback", request.url);
    request.nextUrl.searchParams.forEach((v, k) => callback.searchParams.set(k, v));
    return NextResponse.redirect(callback);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          response.cookies.set(name, value)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected(request.nextUrl.pathname)) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (user && isAuthPath(request.nextUrl.pathname) && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const roleRedirect =
      redirect && redirect.startsWith("/") ? redirect : "/";
    return NextResponse.redirect(new URL(roleRedirect, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
