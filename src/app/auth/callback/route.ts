import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { DEFAULT_VERTICAL } from "@/config/verticals";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Cas confirmation email : créer le profil prestataire si absent
      const { data: existing } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!existing) {
        const nom =
          (data.user.user_metadata?.nom as string | undefined) ??
          data.user.email!;
        await supabase.from("prestataires").insert({
          user_id: data.user.id,
          nom,
          slug: slugify(nom),
          organisme:
            (data.user.user_metadata?.organisme as string | null) ?? null,
          vertical: DEFAULT_VERTICAL,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
