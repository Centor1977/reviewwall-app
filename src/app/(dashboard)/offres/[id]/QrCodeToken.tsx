"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

type Props = {
  url: string;
  token: string;
};

export function QrCodeToken({ url, token }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-${token}.png`;
    link.click();
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div ref={wrapperRef} className="rounded-lg border border-gray-100 bg-white p-1.5">
        <QRCodeCanvas value={url} size={72} marginSize={1} />
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-700"
        title="Télécharger en PNG"
      >
        <Download size={11} />
        PNG
      </button>
    </div>
  );
}
