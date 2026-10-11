"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** The preview catalogue moved to /wholesale; keep old links working. */
export default function WholesalePreviewRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/wholesale"), [router]);
  return null;
}
