"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeskIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/desk/aeo/market-radar");
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );
}
