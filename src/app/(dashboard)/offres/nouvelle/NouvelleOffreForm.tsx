"use client";

import { OffreForm } from "@/components/offres/OffreForm";
import type { VerticalConfig, Vertical } from "@/config/verticals";

type Props = {
  prestataireId: string;
  verticalKey: Vertical;
  vertical: VerticalConfig;
};

export default function NouvelleOffreForm({ prestataireId, verticalKey, vertical }: Props) {
  return (
    <OffreForm
      mode="creation"
      prestataireId={prestataireId}
      verticalKey={verticalKey}
      vertical={vertical}
    />
  );
}
