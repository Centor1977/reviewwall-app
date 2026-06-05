import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchit la session — ne pas supprimer.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Routes prestataire → /login si non connecté
  if (
    pathname.startsWith("/dashboard") || pathname.startsWith("/offres") ||
    pathname.startsWith("/avis") || pathname.startsWith("/parametres") ||
    pathname.startsWith("/onboarding")
  ) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  // Routes apprenant → /connexion-apprenant si non connecté
  if (pathname.startsWith("/mon-profil")) {
    if (!user) return NextResponse.redirect(new URL("/connexion-apprenant", request.url));
  }

  // /choisir → doit être connecté
  if (pathname === "/choisir" && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Routes admin → auth + membership dans admin_users
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!adminRow) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
