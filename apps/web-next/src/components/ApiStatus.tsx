"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ApiStatus() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { api.healthz().then(() => setOk(true)).catch(() => setOk(false)); }, []);
  return <span className="text-xs text-white/40">Hono {ok === null ? "…" : ok ? "●" : "×"}</span>;
}
