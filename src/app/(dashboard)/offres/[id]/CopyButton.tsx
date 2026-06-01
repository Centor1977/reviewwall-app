"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = { text: string };

export function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copier le lien"
      className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50"
    >
      {copied ? (
        <>
          <Check size={13} className="text-green-500" />
          <span className="text-green-600">Copié</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          Copier
        </>
      )}
    </button>
  );
}
