"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="btn-ghost"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> Copy code
        </>
      )}
    </button>
  );
}
