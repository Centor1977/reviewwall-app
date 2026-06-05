import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { DEFAULT_VERTICAL } from "@/config/verticals";
import { getUserRoles } from "@/lib/roles";
import { sendBienvenue } from "@/lib/email/send";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const email = user.email!;

      // ── Admin → redirige directement, sans créer de prestataire ──
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (adminRow) {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }

      // ── Création prestataire si absent (flow register classique) ──
      const { data: existingPrestataire } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!existingPrestataire) {
        const nom =
          (user.user_metadata?.nom as string | undefined) ?? email;
        // Ne crée un prestataire que si l'utilisateur vient du flow register
        // (magic link apprenant n'a pas de métadonnée "nom" forcément)
        if (user.user_metadata?.nom) {
          await supabase.from("prestataires").insert({
            user_id: user.id, nom, slug: slugify(nom),
            organisme: (user.user_metadata?.organisme as string | null) ?? null,
            vertical: DEFAULT_VERTICAL, email,
          });
          sendBienvenue({ email, nom }).catch(console.error);
        }
      }

      // ── Création apprenant si absent et vient d'un magic link ──
      const { data: existingApprenant } = await supabase
        .from("apprenants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let apprenantId: string | null = existingApprenant?.id ?? null;

      if (!existingApprenant && next.startsWith("/mon-profil")) {
        const { data: newApprenant } = await supabase
          .from("apprenants")
          .insert({ user_id: user.id, email })
          .select("id")
          .single();
        apprenantId = newApprenant?.id ?? null;

        // Rattachement rétroactif des avis via participants.email
        if (apprenantId) {
          try {
            await supabase.rpc("rattacher_avis_apprenant", {
              p_email: email,
              p_apprenant_id: apprenantId,
            });
          } catch {
            // Fonction RPC optionnelle — silencieux si absente
          }

          // Fallback manuel si la RPC n'existe pas
          const { data: participants } = await supabase
            .from("participants")
            .select("collecte_tokens(id)")
            .eq("email", email);

          if (participants?.length) {
            const tokenIds = participants
              .flatMap((p) =>
                Array.isArray(p.collecte_tokens)
                  ? p.collecte_tokens.map((t: { id: string }) => t.id)
                  : p.collecte_tokens ? [(p.collecte_tokens as { id: string }).id] : []
              )
              .filter(Boolean);

            if (tokenIds.length > 0) {
              await supabase
                .from("avis")
                .update({ apprenant_id: apprenantId })
                .in("token_id", tokenIds)
                .is("apprenant_id", null);
            }
          }
        }
      }

      // ── Routing selon les rôles ──
      const { isPrestataire, isApprenant } = await getUserRoles(supabase, user.id);

      if (next !== "/dashboard" && next !== "/mon-profil") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (isPrestataire && isApprenant) {
        return NextResponse.redirect(`${origin}/choisir`);
      }
      if (isApprenant) {
        return NextResponse.redirect(`${origin}/mon-profil`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
