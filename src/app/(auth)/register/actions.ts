"use server";

import { sendBienvenue } from "@/lib/email/send";

export async function sendWelcomeEmail(email: string, nom: string) {
  await sendBienvenue({ email, nom });
}
