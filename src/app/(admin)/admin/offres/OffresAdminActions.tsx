"use client";

import { useTransition } from "react";
import { forcerDepublicationOffre } from "./actions";

type Props = { id: string; catalogueForce: boolean };

export function OffresAdminActions({ id, catalogueForce }: Props) {
  const [pending, start] = useTransition();

  function handleDepublier() {
    const msg = catalogueForce
      ? "Cette offre a des avis vérifiés et est normalement verrouillée. Forcer le retrait du catalogue quand même ?"
      : "Retirer cette offre du catalogue ?";
    if (!window.confirm(msg)) return;
    start(() => forcerDepublicationOffre(id));
  }

  return (
    <button onClick={handleDepublier} disabled={pending} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">
      {pending ? "…" : "Dépublier"}
    </button>
  );
}
