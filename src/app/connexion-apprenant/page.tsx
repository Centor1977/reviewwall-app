import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConnexionApprenantForm from "./ConnexionApprenantForm";

export default async function ConnexionApprenantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/mon-profil");
  return <ConnexionApprenantForm />;
}
